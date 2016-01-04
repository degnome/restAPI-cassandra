'use strict';

var Emitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var Verror = require('verror');
var bunyan = require('bunyan');
var DbClient = require('./dbClient');
var Model = require('./models');
var async = require('async');


var log = bunyan.createLogger({
  name        : 'ItemService',
  level       : process.env.LOG_LEVEL || 'info',
  stream      : process.stdout,
  serializers : bunyan.stdSerializers
});


var Service = function(configuration) {
  Emitter.call(this);
  var self = this;
  var continueWith = null;
  var db = new DbClient();
  var config = configuration;
  var Table = null;

  if(!config) {
    config = {};
    config.db = {};
    config.db.host = process.env.DB_HOST || '127.0.0.1';
    config.db.port = process.env.DB_PORT || '9042';
    config.db.keyspace = process.env.DB_KEYSPACE || 'test';
  }

  log.info({}, 'ItemService() Initialized');

  //////////////////////// INITIALIZATION DONE

  var countItems = function(params) {
    // WARNING THIS IS AN EXPENSIVE CALL DO WE WANT TO DO THIS???
    var query = 'SELECT COUNT(*) FROM items;';

    self.emit('send-data', new Model.PageResult());

     db.instance.Item.execute_query(query, null, function(err, result) {
       if(err) {
        return self.emit('send-error', err, 'Failed to Get Count');
       }

      if(length === 0) {
        var pageResult = new Model.PageResult();
        return self.emit('send-data', pageResult);
      }

      params.length = length;
      return self.emit('list-items', params);
     });
  };

    // Check against the DB to make sure the propery doesn't already exist.
  var uniqueCheck = function(args) {
    self.emit('create-item', args);


    /*  EXAMPLE TO UNIQUE CHECK

    var query = { property1: args.property1 };
    table.exists(query, function(err, exists) {
      if(err) {
        return self.emit('send-error', err, 'Failed to Save Item');
      }

      if(exists) {
        return self.emit('send-error', null, 'Duplicate Item');
      }

      return self.emit('createItem', args);
    });
    */
  };

  // CREATE
  var createItem = function(args) {
    var dto = new Model.Item(args);
    var valid = dto.isValid();
    if(valid !== null) {
      return self.emit('send-error', valid, 'Invalid Object');
    }
    var row = new Table(dto);
    row.save(function(err) {
      if(err) {
        let error = new Verror(err, 'CREATEITEMFAILURE');
        return self.emit('send-error', error, 'Failed to Create Item');
      }
      return self.emit('send-data', dto);
    });
  };

  // READ
  var readItem = function(args) {
    Table.findOne(args, function(err, result) {
      var dto = new Model.Item(result);
      if(err) {
        return self.emit('send-error', err, 'Failed to Read Item');
      }
      return self.emit('send-data', dto);
    });
  };

  // UPDATE
  var updateItem = function(args) {
    var options = {ttl: 86400, if_exists: true};
    var id = args.id;
    var changes = new Model.Item(args);
    var valid = changes.isValid();

    if(valid !== null) {
      return self.emit('send-error', valid, 'Invalid Object');
    } else {
      delete changes.id;
    }

    Table.update({id: id}, changes, options, function(err){
      if(err) {
        return self.emit('send-error', err, 'Failed to Update Item');
      }
      changes.id = id;
      return self.emit('send-data', changes);
    });
  };

  // DELETE
  var deleteItem = function(args) {
    Table.delete({id: args.id}, function(err, result) {
      if(err) {
        if(err.message.indexOf('Invalid Value: "1" for Field: id') >= 0) {
          return self.emit('send-data', false);
        }
        else {
          return self.emit('send-error', err, 'Failed to Delete Item');
        }
      }
      return self.emit('send-data', true);
    });
  };

  // Get List from the Database
  var listItems = function(params) {
    var pageResult = new Model.PageResult();

    if(params.pageIndex === undefined || params.pageIndex === null) {
      params.pageIndex = 0;
    }
    if(params.pageSize === undefined || params.pageSize === null) {
      params.pageSize = 50;
    }
    pageResult.currentPage = parseInt(params.pageIndex);
    pageResult.pageSize = parseInt(params.pageSize);
    pageResult.list = [];

    var filter = {};
    filter.$limit = parseInt(params.pageSize) || 10;
    filter.$skip = (params.pageSize) * parseInt(params.pageIndex) || 0;

    Table.find(filter, function(err, rows){
      if(err) return self.emit('send-error', err, 'Failed to Get Item List');

      for(var row of rows) {
        pageResult.list.push(new Model.Item(row));
      }
      return self.emit('send-data', pageResult);
    });
  };

  // Create an Okay Result
  var sendData = function(data) {
    var result = new Model.Response();
    result.success = true;
    result.message = 'All Good';
    result.data = data;
    log.debug(result, 'ItemService.sendData() received');

    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Create a Bad Result
  var sendError = function(err, message) {
    var result = new Model.Response();
    result.success = false;
    result.message = message;
    log.error(err, 'ItemService.sendError');

    if(continueWith) {
      continueWith(null, result);
    }
  };

  var openConnection = function(eventHandler, args) {
    db.connect(config.db, function(err, db) {
     if(err) {
        let error = new Verror(err, 'ECONNREFUSED');
        return self.emit('send-error', error, 'Database Connection Failure');
      }

      if(db.instance.Item === undefined) {
        let error = new Verror(err, 'TABLENOTFOUND');
        return self.emit('send-error', error, 'Database Connection Failure');
      }

      Table = db.instance.Item;
      Table.find({}, function(err, result) {
        if(result.length === 0) {
          log.info('Loaded Default Data', 'ItemService.openConnection()');
          var data = require('./seed.json');
          for (var value of data) {
            var model = new Table(new Model.Item(value));

            //TODO: HOW DO I HANDLE FOR LOOP HERE TO LOAD MORE THEN ONE ITEM???
            model.save(function(err){
              if(err) {
                let error = new Verror(err, 'DEFAULTDATALOAD');
                return self.emit('send-error', error, 'Database Connection Failure');
              }
              return self.emit(eventHandler, args);
            });
          }
        } else {
          return self.emit(eventHandler, args);
        }
      });
    });
  };

  /////////////////////////////////////////

  self.create = function(input, done) {
    log.info({}, 'ItemService.create()');
    log.debug(input, 'ItemService.create()');
		continueWith = done;
    openConnection('create-item', input);
  };

  self.read = function(input, done) {
    log.info(input, 'ItemService.read()');
    log.debug(input, 'ItemService.read()');
		continueWith = done;
    openConnection('read-item', input);
  };
  self.update = function(input, done) {
    log.info({}, 'ItemService.update()');
    log.debug(input, 'ItemService.update()');
		continueWith = done;
    openConnection('update-item', input);
  };
  self.delete = function(input, done) {
    log.info(input, 'ItemService.delete()');
    log.debug(input, 'ItemService.delete()');
		continueWith = done;
    openConnection('delete-item', input);
  };
  self.list = function(input, done) {
    log.info(input, 'ItemService.list()');
    log.debug(input, 'ItemService.list()');
    continueWith = done;
    openConnection('list-items', input);
  };
  self.close = function() {
    db.close();
  };


  // Event Wireup
  self.on('count-items', countItems);
  self.on('create-item', createItem);
  self.on('update-item', updateItem);
  self.on('read-item', readItem);
  self.on('list-items', listItems);
  self.on('delete-item', deleteItem);
  self.on('send-data', sendData);
  self.on('send-error', sendError);

  return self;
};

util.inherits(Service, Emitter);
module.exports = Service;
