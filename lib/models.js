'use strict';
var uuid = require('node-uuid');
var Joi = require('joi');

var Model = function(args) {
  var self = this;
  
  self.User = class User {
    constructor(args) {
      if(!args) { args = {} };
      this.id = args.id || uuid.v4();
      this.username = args.username;
      this.email = args.email;
      this.firstname = args.firstname;
      this.lastname = args.lastname;
    }
        
    isValid() {      
      var result = Joi.validate(this, Joi.object().keys({
          id: Joi.any().allow(null),
          username: Joi.string().alphanum().min(3).max(30).required(),
          email: Joi.string().email().required(),
          firstname: Joi.string().optional().allow(null),
          lastname: Joi.string().optional().allow(null),
          password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).optional().allow(''),
          isValid: Joi.func()
      }));
      return result.error;
    }
  }

  return self;
}

module.exports = new Model();