'use strict';
const Joi = require('Joi');

module.exports.routes = [
{
    method: 'GET',      // Methods Type
    path: '/api/user',  // Url
    config: {
        tags: ['api'],
        description: 'Get All User data',
        notes: 'Get All User data'
    },
    handler: function (request, reply) { //Action

        // Response JSON object
        reply({
            statusCode: 200,
            message: 'Getting All User Data',
            data: [
                {
                    name:'Kashish',
                    age:24
                },
                {
                    name:'Shubham',
                    age:21
                },
                {
                    name:'Jasmine',
                    age:24
                }
            ]
        });
    },
}, 
{
    method: 'POST',
    path: '/api/user',
    config: {
        tags: ['api'],
        description: 'Save user data',
        notes: 'Save user data',
        validate: {
            payload: {
                name: Joi.string().required(),
                age: Joi.number().required()
            }
        }
    },
    handler: function (request, reply) {
        
        reply({
            statusCode: 201,
            message: 'User Saved Successfully'
        });

        // Create mongodb user object to save it into database
        //var user = new UserModel(request.payload);

        // Call save methods to save data into database
        // and pass callback methods to handle error
        // user.save(function (error) {
        //     if (error) {
        //         reply({
        //             statusCode: 503,
        //             message: error
        //         });
        //     } else {
        //         reply({
        //             statusCode: 201,
        //             message: 'User Saved Successfully'
        //         });
        //     }
        // });
    }
}];