'use strict';

var Emitter = require('events').EventEmitter;
var util = require('util');
var path = require('path');
var Verror = require('verror');
var bunyan = require('bunyan');
var DbClient = require('./db');
var PageResult = require('./pageResult.model');
var Response = require('./serviceResult.model');
var User = require('./models').User;
var async = require('async');


var log = bunyan.createLogger({
  name        : 'UserService',
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
  var table = null;

  if(!config) {
    config = {};
    config.db = {};
    config.db.host = process.env.DB_HOST || '127.0.0.1';
    config.db.port = process.env.DB_PORT || '9042';
    config.db.keyspace = process.env.DB_KEYSPACE || 'test';
  }

  log.info({}, 'userService() Initialized');

  //////////////////////// INITIALIZATION DONE
  
  var countItems = function(params) {
    self.emit('send-data', new PageResult());
    
    // db.garages.length(function(err, length){
    //   if(err) {
    //     return self.emit('send-error', err, 'Failed to Get Garage Count');
    //   }

    //   if(length === 0) {
    //     var pageResult = new PageResult();
    //     return self.emit('send-data', pageResult);
    //   }

    //   params.length = length;
    //   return self.emit('list-items', params);
    // });
  };

    // Validation Logic
  var validateHook = function(args){
    self.emit('unique-check', args);

    /*  EXAMPLE TO VALIDATE

    if(!args.property1) {
     return self.emit('send-error', null, 'Property1 is required');
    }
    if(!args.property2) {
      item.property2 = 'Default Value';
    }
    return self.emit('uniqueCheck', args);

    */
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
    var dto = new User(args);
    var valid = dto.isValid();
    if(valid !== null) {
      return self.emit('send-error', valid, 'Invalid Object');
    }
    var row = new table(dto);
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
    table.findOne(args, function(err, result) {
      var dto = new User(result);
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
    var changes = new User(args);
    var valid = changes.isValid();

    if(valid !== null) {
      return self.emit('send-error', valid, 'Invalid Object');
    } else {
      delete changes.id;
    }
    
    table.update({id: id}, changes, options, function(err){
      if(err) {
        return self.emit('send-error', err, 'Failed to Update Item');
      }
      changes.id = id;
      return self.emit('send-data', changes);
    });
  };

  // DELETE
  var deleteItem = function(args) {
    table.delete({id: args.id}, function(err, result) {
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
    var pageResult = new PageResult();

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
  
    table.find(filter, function(err, rows){      
      if(err) return self.emit('send-error', err, 'Failed to Get Item List');
    
      for(var row of rows) {
        pageResult.list.push(new User(row));
      }
      return self.emit('send-data', pageResult);
    });
  };

  // Create an Okay Result
  var sendData = function(data) {
    var result = new Response();
    result.success = true;
    result.message = 'All Good';
    result.data = data;
    log.debug(result, 'userService.sendData() received');

    if(continueWith) {
      continueWith(null, result);
    }
  };

  // Create a Bad Result
  var sendError = function(err, message) {
    var result = new Response();
    result.success = false;
    result.message = message;
    log.error(err, 'userService.sendError');

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
            
      if(db.instance.User === undefined) {
        let error = new Verror(err, 'TABLENOTFOUND');
        return self.emit('send-error', error, 'Database Connection Failure');
      } else {
        table = db.instance.User;
        table.find({}, function(err, result) {
          if(result.length === 0) {
            log.info('Loaded Default Data', 'userService.openConnection()');
            var data = require('../data.json');
            for (var value of data) {
              var model = new table(new User(value));
              
              //TODO: HOW DO I HANDLE FOR LOOP HERE???
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
      }
    }); 
  };

  /////////////////////////////////////////

  self.create = function(input, done) {
    log.info({}, 'userService.create()');
    log.debug(input, 'userService.create()');
		continueWith = done;
    openConnection('create-item', input);
  };

  self.read = function(input, done) {
    log.info(input, 'userService.read()');
    log.debug(input, 'userService.read()');
		continueWith = done;
    openConnection('read-item', input);
  };
  self.update = function(input, done) {
    log.info({}, 'userService.update()');
    log.debug(input, 'userService.update()');
		continueWith = done;
    openConnection('update-item', input);
  };
  self.delete = function(input, done) {
    log.info(input, 'userService.delete()');
    log.debug(input, 'userService.delete()');
		continueWith = done;
    openConnection('delete-item', input);
  };
  self.list = function(input, done) {
    log.info(input, 'userService.list()');
    log.debug(input, 'userService.list()');
    continueWith = done;
    openConnection('list-items', input);
  };
  self.close = function() {
    db.close();
  };


  // Event Wireup
  self.on('count-items', countItems);
  self.on('validate-hook', validateHook);
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
