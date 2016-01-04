'use strict';
var uuid = require('node-uuid');
var Joi = require('joi');

var Model = function(args) {
  var self = this;

  var _itemSchema = {
      id: Joi.string().guid(),
      uniqueProperty: Joi.string().alphanum().min(3).max(30),
      property1: Joi.string().optional(),
      property2: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).optional().allow(''),
      property3: Joi.number().optional()
  };


  self.Item = class Item {
    constructor(args) {
      if(!args) { args = {} };
      this.id = args.id || uuid.v4();
      this.uniqueProperty = args.uniqueProperty;
      this.property1 = args.property1;
      this.property2 = args.property2 || '';
      this.property3 = args.property3;
    }

    isValid() {
      return Joi.validate(this, Joi.object().keys(_itemSchema)).error;
    }
  }


  self.PageResult = class {
    constructor() {
      this.pages = 0;
      this.currentPage = 0;
      this.count = 0;
      this.list = [];
    }
  }

  self.Response = class {
    constructor(args) {
      if(!args) { args = {} };
      this.success = false || args.success;
      this.message = null || args.message;
      this.data = null;
    }
  }

  self.Schema = {
    Item: _itemSchema
  }

  return self;
}

module.exports = new Model();