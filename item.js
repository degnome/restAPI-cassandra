'use strict';
var Joi = require('joi');

module.exports = class Greeter {
  constructor(name) {
    this.name = name;
  }
  sayHello() {
    return "Hello " + this.name;
  }
}