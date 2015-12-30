/* jshint -W024, -W101, -W079, -W098 -W031 */
/* jshint expr:true */
'use strict';

const should = require('chai').should();
var Service = require('../lib/userService');
var config = require('./config.json');

var service = new Service(config);

describe('Services API', () => {
	describe('List Features', () => {
		var output = null;

    it('Gets a list of Items', function(done){
      var params = {};
      service.list(params, function(err, result){
        output = result.data.list;
        output.should.be.instanceOf(Array).with.length.above(0);
        done();
      });
    });

    describe('List Property Values', () => {
      it('Defines a username', function(){
        output[0].should.have.property('username');
      });
      it('Defines a email', function(){
        output[0].should.have.property('email');
      });
      it('Defines a firsthame', function(){
        output[0].should.have.property('firstname');
      });
      it('Defines a lastname', function(){
        output[0].should.have.property('lastname');
      });
    });
	});
});

describe('CRUD Features', () => {

  it('Creates new item', function(done) {
    var input = {};
    input.username = 'CreateTest';
    input.email = 'create@mail.com';
    input.firstname = 'Unit';
    input.lastname = 'Test';
    service.create(input, function(err, result) {
      result.success.should.be.true;
      var user = result.data;
      (user.id === undefined).should.not.be.true;
      user.username.should.be.equal(input.username);
      user.email.should.be.equal(input.email);
      user.firstname.should.be.equal(input.firstname);
      user.lastname.should.be.equal(input.lastname);
      done();
    })
  });
  
});


// describe('CRUD Features', () => {
//   var output = null;
//   it('Create new garage', function(done){
//     var input= {};
//     input.description = "Test1";
//     input.address = {};
//     input.address.street = "700 Hidden Ridge";
//     input.address.city = "Irving";
//     input.address.state = "TX";
//     input.address.zip = "75038";
//     input.contact = "9999999999";

//     service.create(input,function(err,result){
//         output = result;
//         done();
//     })
//   });
// });



// describe('Test cases', () => {
//     let User = require('../user.js');
    
//     it('should be invalid with no username', function() {
//         var args = {email: 'test@mail.com'};
//         var user = new User(args);
//         user.isValid().should.be.false;
//         user.email.should.be.equal(args.email);
//     });
    
//     it('should be invalid with no email', function() {
//         var args = {username: 'UnitTest'};
//         var user = new User(args);
//         user.username.should.be.equal(args.username);
//         user.isValid().should.be.false;
//     });
    
//     it('should be valid with username and email', function() {
//       var args = { 
//          email: 'test@mail.com',
//          username: 'UnitTest',
//          firstname: 'FirstName',
//          lastname: 'LastName',
//          password: 'Password'
//        };
       
//        var user = new User(args);
//        user.isValid().should.be.true;
//        (user.id === undefined).should.be.true;
//        user.email.should.be.equal(args.email);
//        user.username.should.be.equal(args.username);
//        user.firstname.should.be.equal(args.firstname);
//        user.lastname.should.be.equal(args.lastname);
//        user.password.should.be.equal(args.password);
//     });
    
//     it('should get a list of users', function() {
//       var list = User.List();
//       list.should.be.instanceOf(Array);
//     });
    
//     it('should be able to get a user', function() {
//       var id = 12345;
//       var user = User.Retrieve(12345);
//       user.id.should.be.equal(id);
//     })
    
// });