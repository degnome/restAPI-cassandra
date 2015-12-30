'use strict';
var uuid = require('node-uuid');
var Joi = require('joi');

class User {
  constructor(args) {
    if(!args) { args = {} };
    this.id = args.id || uuid.v4();
    this.username = args.username;
    this.email = args.email;
    this.firstname = args.firstname;
    this.lastname = args.lastname;
  }
  
  isValid(err) {
    var schema = Joi.object().keys({
        id: Joi.any().allow(null),
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        firstname: Joi.string().optional().allow(null),
        lastname: Joi.string().optional().allow(null),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).optional().allow('')
    });
    
    var result = Joi.validate(this, schema);
    if(!result.error) return true;
    err = result.error;
    return false; 
  }

}

module.exports = User;