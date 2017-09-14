const { Readable, Writable } = require('stream')
const methods = require('http').METHODS.reduce((p, c) => (p[c] = c) && p, {})

/**
 * Mimics an incoming message - for testing.
 *
 * Returns a mock `http(s || \2).IncomingMessage`. The value passed
 * as `content` will be the body... the properties `.method` and
 * `.url` can be used to get and set the method and url respectively.
 *
 * @param {String|Buffer}
 * @returns {Object}
 */
module.exports.createIncomingMessage = function (content = Buffer.from('')) {
  const buf = Buffer.from(content)
  const length  = buf.length
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
    }
  })

  Object.defineProperty(readable, 'method', {
    get() { return method },
    set(_method) { method = _method }
  })

  Object.defineProperty(readable, 'url', {
    get() { return url },
    set(_url) { url = _url }
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
  let statusText
  const chunks = []
  const headers = {}

  const writable = new Writable({
    write(chunk, encoding, callback) {
      len += chunk.length
      chunks.push(chunk)
      callback && callback()
    }
  })

  const p = new Promise(function (resolve) {
    writable.on('finish', function () {
      resolve(Buffer.concat(chunks, len))
    })
  })

  writable.writeHead = function (statusCode, statusMessage, _headers) {
    statusCode = statusCode,
    statusMessage = statusMessage,
    Object.assign(headers, _headers)
  }

  writable.setHeader = function (name, value) {
    headers[name] = value
  }

  writable.getHeader = function (name) {
    return headers[name]
  }

  Object.defineProperty(writable, 'length', { get() { return len } })
  Object.defineProperty(writable, 'status', { get() { return statusCode } })
  Object.defineProperty(writable, 'statusText', { get() { return statusText } })
  Object.defineProperty(writable, 'headers', { get() { return Object.assign({}, headers)} })

  writable.buffer = function () {
    return p
  }

  writable.json = async function () {
    const buf = await writable.buffer()
    return JSON.parse(buf)
  }

  writable.text = async function () {
    const buf = await writable.buffer()
    return buf.toString('utf8')
  }

  return writable
}
