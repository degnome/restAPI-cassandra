'use strict';

// ================ Base Setup ========================

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Boom = require('Boom');
const Pack = require('./package');
const Routes = require('./routes');


// Create Server Object
const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 7002
});

const swaggerOptions = {
  info: {
    'title': 'User API Documentation',
    'version': Pack.version,
  }
};

server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: swaggerOptions
  }], (err) => {
    if (err) {
      server.log(['error'], 'hapi-swagger load error: ' + err)
    } else {
      server.log(['start'], 'hapi-swagger interface loaded')
    }
  });

server.route(Routes.routes);

// =============== Start our Server =======================
// Lets start the server
server.start(() => {
  console.log('Server running at:', server.info.uri);
});
