var Boom = require('boom')
var crypto = require('crypto')
var Joi = require('joi')
var pkg = require('../package.json')

var SIGNATURE_HEADER = 'x-dropbox-signature'

var headerValidator = Joi.string().length(64).required()
var optionsValidator = Joi.object().keys({
    appSecret: Joi.string().min(1).required(),
    onNotification: Joi.func().required(),
    path: Joi.string().min(1).required(),
})

exports.register = register

register.attributes = {
    pkg: pkg,
}

function register(server, options, next) {
    var validationError = optionsValidator.validate(options).error
    if (validationError) return next(validationError)
    server.route({
        method: 'GET',
        path: options.path,
        config: {
            validate: {
                query: {
                    challenge: Joi.string().min(1).required(),
                },
            },
            handler: function (request, reply) {
                return reply(request.query.challenge)
            },
        },
    })
    server.route({
        method: 'POST',
        path: options.path,
        config: {
            payload: {
                parse: false,
            },
            validate: {
                headers: function (value, options, next) {
                    return next(headerValidator.validate(value[SIGNATURE_HEADER]).error)
                },
            },
            handler: function (request, reply) {
                var payload = request.payload.toString()
                var signature = request.headers[SIGNATURE_HEADER]
                if (signature !== crypto.createHmac('sha256', options.appSecret).update(payload).digest('hex')) {
                    return reply(Boom.forbidden())
                }
                options.onNotification(JSON.parse(payload))
                return reply()
            },
        },
    })
    return next()
}
