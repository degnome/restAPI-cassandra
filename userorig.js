'use strict';
var Joi = require('joi');

var User = function(args) {
    var self = this;
    
    ////  PROPERTIES
    if(!args) { args = {} };
    self.id = args.id;
    self.username = args.username || null;
    self.email = args.email || null;
    self.firstname = args.firstname || null;
    self.lastname = args.lastname || null;
    self.password = args.password || '';
    
    var toDTO = function() {
        var args = {};
        args.id = self.id;
        args.username = self.username;
        args.email = self.email;
        args.firstname = self.firstname;
        args.lastname = self.lastname;
        args.password = self.password;
        return args;
    }
    
    
    ////  VALIDATION
    var schema = Joi.object().keys({
        id: Joi.any().allow(null),
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        firstname: Joi.string().optional().allow(null),
        lastname: Joi.string().optional().allow(null),
        password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).optional().allow(''),
        isValid: Joi.func()
    });
    
    
    
    var validateItem = function(err) {
       var model = toDTO();
       var result = Joi.validate(model, schema);
        if(!result.error) {
            return true;
        }
        err = result.error;
        return false; 
    }
    
     
    ////  CRUD FUNCTIONS

    var addInDB = function() {
        
    }
    
    var readFromDB = function() {
        
    }
    
    var updateInDB = function() {
        
    }
    
    var deleteFromDB = function() {
        
    }
    
    /////////////////////////////////////
    
    self.isValid = validateItem;
    
    self.save = function(err, next) {
        if (self.isValid(err)) {
            if(!self.Id) {
                addInDB();
            }
            else {
                updateInDB();
            }
        }
        return err;
    }
    
    return self;
}

module.exports = User;