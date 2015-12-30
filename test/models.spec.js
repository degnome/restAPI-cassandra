/* jshint -W024, -W101, -W079, -W098 */
/* jshint expr:true */
'use strict';

var should = require('chai').should();
var DTO = require('../lib/models');

describe('The user.model', function() {
  var Model = DTO.User;

  var args = {};
  args.username = 'username';
  args.email = 'email@mail.com';
  args.firstname = 'firstname';
  args.lastname = 'lastname';

  describe('User Defaults', function() {
    var model;

    before(function() {
      model = new Model();
    });
    it('should have an id', function() {
      should.exist(model.id);
      console.log(model);
    });
    it('should not have a username', function() {
      should.not.exist(model.username);
    });
    it('should not have a email', function() {
      should.not.exist(model.email);
    });
    it('should not have a firstname', function() {
      should.not.exist(model.state);
    });
    it('should not have a lastname', function() {
      should.not.exist(model.zip);
    });

  });
  describe('User with Arguments', function() {
    var model;

    before(function() {
      model = new Model(args);
    });
    it('has a username', function() {
      model.username.should.equal(args.username);
    });
    it('has a email', function() {
      model.email.should.equal(args.email);
    });
    it('has a firstname', function() {
      model.firstname.should.equal(args.firstname);
    });
    it('has a lastname', function() {
      model.lastname.should.equal(args.lastname);
    });
  });
});