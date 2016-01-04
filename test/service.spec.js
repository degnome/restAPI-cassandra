/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
const uuid = require('node-uuid');
var Service = require('../lib/service');
var Client = require('../lib/dbClient');
var config = require('./config.json');
var Item = require('../lib/models').Item;

describe('Services API', () => {
  var db = new Client();
  var Table, service = null;

  before(function(done){
    service = new Service(config);
    db.connect(config.db, function(err, db) {
      db.instance.Item.execute_query('truncate test.ITEM;', null, function(err, result) {
        Table = db.instance.Item;
        done();
      });
    });
  });

	describe('List Features', () => {
		var item = null;

    it('should respond with a JSON Object with Items as an Array', function(done){
      service.list({pageSize: 5, pageIndex: 0}, function(err, result) {
        (err === null).should.be.true;
        result.data.list.should.be.instanceof(Array);
        result.data.list.should.have.length.above(0);
        item = result.data.list[0];
        done();
      });
    });

    describe('List Property Values', () => {
      it('Defines a uniqueProperty', function(){
        item.should.have.property('uniqueProperty');
      });
      it('Defines a property1', function(){
        item.should.have.property('property1');
      });
      it('Defines a property2', function(){
        item.should.have.property('property2');
      });
      it('Defines a property3', function(){
        item.should.have.property('property3');
      });
    });
	});

  describe('CRUD Features', () => {

    describe('Create Item', () => {
      var dto = {
        "uniqueProperty": "unique",
        "property1": "anyString",
        "property2": "anotherString",
        "property3": 123
      };
      var item = null;

      it('Creates an Item and returns success with an item', function(done){
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
      it('Defines a Unique property1', function(done) {
        item.should.have.property('uniqueProperty', dto.uniqueProperty);
        done();
      });
      it('Defines a Property property1', function(done) {
        item.should.have.property('property1', dto.property1);
        done();
      });
      it('Defines a Property property2', function(done) {
        item.should.have.property('property2', dto.property2);
        done();
      });
      it('Defines a Property property3', function(done) {
        item.should.have.property('property3', dto.property3);
        done();
      });

      after(function(done) {
        Table.delete({id: item.id}, function(err){
          done();
        });
      });
    });

    describe('Read Item', () =>  {
      var dto = {
        "id": uuid.v4(),
        "uniqueProperty": "unique",
        "property1": "anyString",
        "property2": "anotherString",
        "property3": 123
      };

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

      it('Retrieves an an indexed item by Property', function(done) {
        var params = { uniqueProperty: dto.uniqueProperty };
        service.read(params, function(err, result) {
          result.success.should.be.true;
          result.data.uniqueProperty.should.be.equal(dto.uniqueProperty);
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
      var dto = {
        "id": uuid.v4(),
        "uniqueProperty": "unique",
        "property1": "anyString",
        "property2": "anotherString",
        "property3": 123
      };

      before(function(done) {
        var item = new Table(dto);
        item.save(function(err) {
          done();
        });
      });

      it('Updates an item by Id', function(done) {
        dto.property1 = 'ChangedProperty';
        dto.property2 = 'ChangedAnotherProperty';

        service.update(dto, function(err, result) {
          result.success.should.be.true;
          result.data.property1.should.equal(dto.property1);
          result.data.property2.should.equal(dto.property2);
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
      var dto = {
        "id": uuid.v4(),
        "uniqueProperty": "unique",
        "property1": "anyString",
        "property2": "anotherString",
        "property3": 123
      };

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
      db.instance.Item.drop_table(function(err) {
        db.close();
        done();
      });
    });
  });
});