/* jshint -W024, -W101, -W079, -W098 */
/* jshint expr:true */
'use strict';

var should = require('chai').should();
var Model = require('../lib/models');

describe('Model.item', () => {
  describe('Defaults', () => {
    var model = new Model.Item();
    it('should have an id', () =>  should.exist(model.id) );
    it('should not have a uniqueProperty', () => should.not.exist(model.uniqueProperty));
    it('should not have a property1', () => should.not.exist(model.property1));
    it('should have an empty property2', () => model.property2.should.be.empty);
    it('should not have a property3', () => should.not.exist(model.property3));
    it('should be valid', () => should.not.exist(model.isValid()));
  });
  describe('Arguments', () => {
    var args = {
      uniqueProperty: 'Unique',
      property1: 'anystring',
      property2: 'anotherstring',
      property3: 123
    };
    var model = new Model.Item(args);
    it('should have an id', () =>  should.exist(model.id) );
    it('should have a uniqueProperty', () => model.uniqueProperty.should.equal(args.uniqueProperty));
    it('should have a property1', () => model.property1.should.equal(args.property1));
    it('should have a property2', () => model.property2.should.equal(args.property2));
    it('should have a property3', () => model.property3.should.equal(args.property3));
    it('should be valid', () => should.not.exist(model.isValid()));
  });
});