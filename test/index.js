var _ = require('lodash')
var BPromise = require('bluebird')
var Hapi = require('hapi')
var Plugin = require('../')
var url = require('url')
var Wreck = require('wreck')

var NOTIFICATION_SIGNATURE = '0a8c16b085420b960dc78664279fe09e936a2a01b1f91064869d9e77dfd64529'
var NOTIFICATION_PAYLOAD = '{"delta": {"users": [12345]}}'
var APP_SECRET = 'the_secret'
var CHALLENGE = 'the_challenge'
var PROTOCOL = 'http'
var HOSTNAME = '127.0.0.1'
var PORT = 3001
var PROTOCOL = 'http'
var PATHNAME = '/test'
var GET_URI = url.format({
    protocol: PROTOCOL,
    hostname: HOSTNAME,
    port: PORT,
    pathname: PATHNAME,
    query: {
        challenge: CHALLENGE,
    },
})
var POST_URI = url.format({
    protocol: PROTOCOL,
    hostname: HOSTNAME,
    port: PORT,
    pathname: PATHNAME,
})

var get = BPromise.promisify(Wreck.get)
var post = BPromise.promisify(Wreck.post)

describe('the plugin', function () {

    var server = new Hapi.Server()
    var payloads = []

    server.connection({
        host: HOSTNAME,
        port: PORT,
    })

    server.on('request-error', function (err) {
        throw err
    })

    server.register({
        register: Plugin,
        options: {
            appSecret: APP_SECRET,
            onNotification: function (payload) {
                payloads.push(payload)
            },
            path: PATHNAME,
        },
    }, function (err) {
        if (err) throw err
    })

    before(server.start.bind(server))
    after(server.stop.bind(server))

    it('should accept verification requests', function (done) {
        get(GET_URI).then(function (res) {
            _.first(res).statusCode.should.equal(200)
            _.last(res).should.equal(CHALLENGE)
            return done()
        }, done)
    })

    it('should accept signed notification requests', function (done) {
        var options = {
            headers: {
                'X-Dropbox-Signature': NOTIFICATION_SIGNATURE,
            },
            payload: NOTIFICATION_PAYLOAD,
        }
        post(POST_URI, options).then(function (res) {
            _.first(res).statusCode.should.equal(200)
            payloads.pop().should.eql(JSON.parse(NOTIFICATION_PAYLOAD))
            return done()
        }, done)
    })

    it('should reject unsigned notification requests', function (done) {
        var options = {
            headers: {
                // a bogus signature
                'X-Dropbox-Signature': _.range(64).reduce(function (memo) { return memo + 'x' }, ''),
            },
            payload: NOTIFICATION_PAYLOAD,
        }
        post(POST_URI, options).then(function (res) {
            _.first(res).statusCode.should.equal(403)
            return done()
        }, done)
    })

    it('should ID the routes', function () {
        server.lookup('dropbox-webhooks-get').should.have.properties({
            method: 'get',
            path: PATHNAME,
        })
        server.lookup('dropbox-webhooks-post').should.have.properties({
            method: 'post',
            path: PATHNAME,
        })
    })

})
