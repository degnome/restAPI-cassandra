'use strict';
var Joi = require('joi');
var Service = require('../lib/service');
var Schema = require('../lib/models').Schema;
var config = require('../config.json');
var _schema = Schema.Item;

module.exports.routes = [
{
  method: 'GET',      // Methods Type
  path: '/item',  // Url
  config: {
      description: 'Get all instances of Items',
      notes: 'Get a list of Items',
      tags: ['api'],
      validate: {
          params: {
            pageSize: Joi.number(),
            pageIndex: Joi.number()
          }
      }
  },
  handler: function (request, reply) { //Action
  console.log(request.query);
    var service = new Service(config);
    var params = {
      pageSize: request.query.pageSize || 5,
      pageIndex: request.query.pageIndex || 0
    };

    service.list(params, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},
{
  method: 'GET',      // Methods Type
  path: '/item/{id}',  // Url
  config: {
      description: 'Get an instance of Item by Id',
      notes: 'Get an Item',
      tags: ['api'],
      validate: {
          params: {
            id: Joi.string().guid()
          }
      }
  },
  handler: function (request, reply) { //Action
    var service = new Service(config);
    var params = {pageSize: 5, pageIndex: 0};

    service.read(params.id, function(err, result) {
      if(err) {
        reply({
          statusCode: 500,
          message: err
        });
      } else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  },
},
{
  method: 'POST',
  path: '/item',
  config: {
      description: 'Create a new instance of a Item',
      notes: 'Save an Item',
      tags: ['api'],
      validate: {
          payload: Schema.Item
      }

  },
  handler: function (request, reply) {
    var service = new Service(config);
    service.create(request.payload, function(err, result) {
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        reply(result.data).created('/item/' + result.data.id);
      }
    });
  }
},
{
  method: 'PUT',
  path: '/item',
  config: {
      description: 'Update an existing instance of a Item',
      notes: 'Update an Item',
      tags: ['api'],
      validate: {
          payload: Schema.Item
      }

  },
  handler: function (request, reply) {
    var service = new Service(config);
    service.update(request.payload, function(err, result) {
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        reply({
          statusCode: 200,
          message: 'successful operation',
          data: result.data
        });
      }
    });
  }
},
{
  method: 'DELETE',
  path: '/item/{id}',
  config: {
      description: 'Delete an instance of a Item',
      notes: 'Delete an Item',
      tags: ['api'],
      validate: {
          params: {
            id: Joi.string().guid()
          }
      }
  },
  handler: function (request, reply) {
    var service = new Service(config);
    service.delete(request.query.id, function(err, result) {
      if(err) {
        reply({ statusCode: 500, message:err });
      }
      else {
        reply({ statusCode: 200, message: 'successful operation' });
      }
    });
  }
}];