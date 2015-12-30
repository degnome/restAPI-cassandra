const Boom = require('Boom');

module.exports.routes = [
    {
        method: 'GET',
        path: '/status',
        handler: function(request,reply) {
            reply('ok');
        }
    }, {
        method: 'GET',
        path: '/favicon.ico',
        handler: function(request,reply) {
            reply(Boom.notFound());
        }
    }
]