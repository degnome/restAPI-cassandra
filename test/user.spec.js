/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const uuid = require('node-uuid');
var Service = require('../lib/userService');
var Client = require('../lib/db');
var config = require('./config.json');
var Item = require('../lib/models').User;
var service = new Service(config);

describe('Services API', () => {
  var db = new Client();
  var Table, service = null;
  
  before(function(done){
    service = new Service(config);
    db.connect(config.db, function(err, db) {
      db.instance.User.execute_query('truncate test.USER;', null, function(err, result) {
        Table = db.instance.User;
        done();
      });
    });
  });
    
	describe('List Features', () => {
		var item = null;

    it('should respond with a JSON Object with Users as an Array', function(done){
      service.list({pageSize: 5, pageIndex: 0}, function(err, result) {
        (err === null).should.be.true;
        result.data.list.should.be.instanceof(Array);
        result.data.list.should.have.length.above(0);
        item = result.data.list[0];
        done();
      });
    });

    describe('List Property Values', () => {
      it('Defines a username', function(){
        item.should.have.property('username');
      });
      it('Defines a email', function(){
        item.should.have.property('email');
      });
      it('Defines a firsthame', function(){
        item.should.have.property('firstname');
      });
      it('Defines a lastname', function(){
        item.should.have.property('lastname');
      });
    });
	});
  
  describe('CRUD Features', () => {
  
    describe('Create Item', () => {
      var dto = require('./item.json');
      dto.id = uuid.v4();
      var item = null;
      
      it('Creates a User and returns success with a user', function(done){
        service.create(dto, function(err, result) {
          result.should.not.be.equal(null);
          result.success.should.be.true;
          item = result.data;
          done();
        });
      });
      it('Defines a Property id', function(done) {
        (item.id === null).should.be.false;
        done();
      });
      it('Defines a Property username', function(done) {
        item.should.have.property('username', dto.username);
        done();
      });
      it('Defines a Property email', function(done) {
        item.should.have.property('email', dto.email);
        done();
      });
      it('Defines a Property firstname', function(done) {
        item.should.have.property('firstname', dto.firstname);
        done();
      });
      it('Defines a Property lastname', function(done) {
        item.should.have.property('lastname', dto.lastname);
        done();
      });
      
      after(function(done) {
        Table.delete({id: item.id}, function(err){
          done();
        });
      });
    });
      
    describe('Read Item', () =>  {
      var dto = require('./item.json');
      dto.id = uuid.v4();
      
      before(function(done) {
        var item = new Table(dto);
        item.save(function(err) {
          done();
        });
      });
    
      it('Retrieves an item by id', function(done) {
        var params = { id: dto.id };
        service.read(params, function(err, result) {
          result.success.should.be.true;
          result.data.id.should.be.equal(dto.id);
          done();
        });
      });
      
      it('Retrieves an item by username', function(done) {
        var params = { username: dto.username };
        service.read(params, function(err, result) {
          result.success.should.be.true;
          result.data.username.should.be.equal(dto.username);
          done();
        });
      });
      
      after(function(done) {
        Table.delete({id: dto.id}, function(err){
          done();
        });
      });
    });
  
    describe('Update Item', function() {
      var dto = require('./item.json');
      dto.id = uuid.v4();
      
      before(function(done) {
        var item = new Table(dto);
        item.save(function(err) {
          done();
        });
      });
            
      it('Updates an item by Id', function(done) {
        dto.firstname = 'ChangedFirstName';
        dto.lastname = 'ChangedLastName';

        service.update(dto, function(err, result) {
          result.success.should.be.true;
          result.data.firstname.should.equal(dto.firstname);
          result.data.lastname.should.equal(dto.lastname);
          done();
        });
      });
      
      after(function(done) {
        Table.delete({id: dto.id}, function(err){
          done();
        });
      });
    });
    
    describe('Delete Item', function() {
      var dto = require('./item.json');
      dto.id = uuid.v4();
      
      before(function(done) {
        var item = new Table(dto);
        item.save(function(err) {
          done();
        });
      });

      it('Deletes an item by Id', function(done) {
        service.delete(dto, function(err, result) {
          result.success.should.be.true;
          done();
        });
      });
      
      after(function(done) {
        Table.delete({id: dto.id}, function(err){
          done();
        });
      });
    });
    
  });
  
  
  after(function(done){
    db.connect(config.db, function(err, db) {
      db.instance.User.drop_table(function(err) {
        db.close();
        done();
      });
    });
  });
});