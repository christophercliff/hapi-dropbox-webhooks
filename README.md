# hapi-dropbox-webhooks

[![Build Status](https://travis-ci.org/christophercliff/hapi-dropbox-webhooks.png?branch=master)](https://travis-ci.org/christophercliff/hapi-dropbox-webhooks)

A [Hapi](http://hapijs.com/) plugin for receiving notifications from the [Dropbox webhooks API](https://www.dropbox.com/developers/webhooks/docs).

## Installation

```
npm install hapi-dropbox-webhooks
```

## Usage

```js
var DropboxWebhooks = require('hapi-dropbox-webhooks')

server.register({
  register: DropboxWebhooks,
  options: options,
})
```

### Options

- **`appSecret`** `String`

    The [app secret](https://www.dropbox.com/developers/support#api-keys). Required.

- **`onNotification`** `Function`

    The callback to be invoked when a notification is received. The function has the signature `function(payload)`. Required.

- **`path`** `String`

    The path to listen on. Required.


## Tests

```
$ npm test
```

## License

See [LICENSE](https://github.com/christophercliff/hapi-dropbox-webhooks/blob/master/LICENSE.md).
