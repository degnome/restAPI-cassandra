const Boom = require('Boom');

module.exports.routes = [
    {
        method: 'GET',
        path: '/ping',
        handler: function(request,reply) {
            reply('pong');
        },
        config: {
          description: 'Test API',
          notes: 'Returns pong',
          tags: ['api']
        }
    }, {
        method: 'GET',
        path: '/favicon.ico',
        handler: function(request,reply) {
            reply(Boom.notFound());
        }
    }
]