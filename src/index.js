const { Readable, Writable } = require('stream')
const { METHODS, STATUS_CODES } = require('http')

const methods = METHODS.reduce((p, c) => (p[c] = c) && p, {})

module.exports.METHODS = methods
module.exports.STATUS_CODES = STATUS_CODES

/**
 * Mimics an incoming message - for testing.
 *
 * Returns a mock `IncomingMessage`. The value passed
 * as `content` will be the body... the properties `.method` and
 * `.url` can be used to get and set the method and url respectively.
 *
 * @param {String|Buffer}
 * @returns {Object}
 */
module.exports.createIncomingMessage = function (content = Buffer.from('')) {
  const buf = Buffer.from(content)
  const len = buf.length
  let method = methods.GET
  let url = ''
  let position = 0

  const readable = new Readable({
    read() {
      if (position === -1) return this.push(null)

      const start = position
      position += 16
      const end = position <= len ? position : (position = -1) && len
      const chunk = Buffer.from(buf.slice(start, end))
      return this.push(chunk)
    },
  })

  const p = new Promise(function (resolve, reject) {
    let len = 0 // eslint-disable-line no-shadow
    const chunks = []

    readable.on('data', function (chunk) {
      len += chunk.length
      chunks.push(chunk)
    })

    readable.on('error', reject)

    readable.on('end', function () {
      resolve(Buffer.concat(chunks, len))
    })
  })

  readable.buffer = function () {
    return p
  }

  Object.defineProperty(readable, 'method', {
    get() { return method },
    set(_method) { method = _method },
  })

  Object.defineProperty(readable, 'url', {
    get() { return url },
    set(_url) { url = _url },
  })

  return readable
}

/**
 * Mimics a server response - you know... for the kids.
 *
 * It returns a mock `http(s || \2).ServerResponse` instance. That
 * also implements much of the HTML5 `fetch` `Response` interface.
 * Calling `serverResponse.buffer` returns a promise that resolves
 * when the response is fully written... the properties `length` (
 * the internal buffer length), `.status`, `statusText` and
 * `.headers` can be used to fetch values written to the response.
 *
 * So this basically it's a monstrosity that implements both the
 * `ServerResponse` and HTML5 `fetch` `Response` interface.
 *
 * @returns {Object}
 */
module.exports.createServerResponse = function () {
  let len = 0
  let statusCode
  let statusMessage
  const chunks = []
  const headers = {}

  const writable = new Writable({
    write(chunk, encoding, callback) {
      len += chunk.length
      chunks.push(chunk)
      callback && callback()
    },
  })

  const p = new Promise(function (resolve) {
    writable.on('finish', function () {
      resolve(Buffer.concat(chunks, len))
    })
  })

  /**
   * Node.js core http || https || http\2 `ServerResponse` class methods.
   *
   * TODO: There are a tonne of methods missing... they can be added as
   * needed.
   */
  writable.writeHead = function (_statusCode, _statusMessage, _headers = {}) {
    statusCode = _statusCode
    if (typeof _statusMessage === 'object') {
      _headers = _statusMessage
      _statusMessage = undefined
    }

    if (!statusMessage && !_statusMessage) _statusMessage = STATUS_CODES[_statusCode]
    if (_statusMessage) statusMessage = _statusMessage
    Object.assign(headers, _headers)
  }

  Object.defineProperty(writable, 'statusCode', {
    set(value) {
      statusCode = value
      if (!statusMessage) statusMessage = STATUS_CODES[statusCode]
    },
  })

  Object.defineProperty(writable, 'statusMessage', {
    set(value) {
      statusMessage = value
    },
  })

  writable.setHeader = function (name, value) {
    headers[name] = value
  }

  writable.getHeader = function (name) {
    return headers[name]
  }

  /**
   * The HTML5 Response interface - this also implements only a
   * subset of methods.
   */
  Object.defineProperty(writable, 'ok', { get() { return statusCode >= 200 && statusCode < 300 } })
  Object.defineProperty(writable, 'status', { get() { return statusCode } })
  Object.defineProperty(writable, 'statusText', { get() { return statusMessage } })
  Object.defineProperty(writable, 'headers', { get() { return Object.assign({}, headers) } })

  // NOTE: This should be used in place of `blob` to buffer up the raw body.
  writable.buffer = function () {
    return p
  }

  // NOTE: Not standard - an added helper.
  Object.defineProperty(writable, 'length', { get() { return len } })

  return writable
}
