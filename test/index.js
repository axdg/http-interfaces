const test = require('ava')
const { Readable, Writable } = require('stream')

/**
 * NOTE: Ava doesn't transpile source :( We have to do it outselves.
 */
require("babel-register")
const functions = require('../src/index.js')

/**
 * Mimics an incoming message - for testing.
 *
 * Returns a mock `http(s).IncomingMessage`. The value passed
 * as `content` will be the body... the property `.method` can
 * be used to get and set the `incomingMessage.method`
 *
 * @param {String}
 * @returns {Object}
 */
const createIncomingMessage = function (content = '') {
  const buf = Buffer.from(content)
  const len  = buf.length
  let method = 'GET'
  let url = ''
  let position = 0

  const readable = new Readable({
    read() {
      if (position === -1) return this.push(null)

      const start = position
      position += 4
      const end = position <= len ? position : (position = -1) && len
      const chunk = Buffer.from(buf.slice(start, end))
      return this.push(chunk)
    }
  })

  Object.defineProperty(readable, 'method', {
    get() { return method }
    set(_method) { method = _method }
  })
}

/**
 * Mimics a server response - you know... for the kids.
 *
 * It returns a mock `http(s).ServerResponse` instance. That
 * also implements much of the HTML5 `fetch` `Response` interface.
 * Calling `serverResponse.buffer` returns a promise that resolves
 * when the response is fully written... the properties `length` (
 * the internal buffer length), `.status`, `statusText` and
 * `.headers` can be used to fetch values written to the response.
 *
 * So this basically implements both the
 *
 * @returns {Object}
 */
const createServerResponse = function () {
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

  // Similar to `serverResponse.writeHead`.
  writable.writeHead = function (statusCode, statusMessage, _headers) {
    statusCode = statusCode,
    statusMessage = statusMessage,
    Object.assign(headers, _headers)
  }

  // Similar to `serverResponse.setHeader`
  writable.setHeader = function (name, value) {
    headers[name] = value
  }

  // Similar to `serverResponse.getHeader`
  writable.getHeader = function (name) {
    return headers[name]
  }

  // NOTE: Helpers for reading the written values.
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

  return writable
}

test('handler instantiation', async function (t) {
  const { createHandler, buffer } = functions
  const fn = async () => null

  // NOTE: Just making sure it returns a function.
  const handler = createHandler(fn)
  t.true(typeof handler === 'function')
})

test('handler deals with objects as json', async function (t) {
  const { createHandler, buffer } = functions

  const data = { testing: true }
  const str = JSON.stringify(data, null, 2)

  const fn = async () => data
  const handler = createHandler(fn)

  const req = createIncomingMessage()
  const res = createServerResponse()

  handler(req, res)

  const buf = await res.buffer()

  t.deepEqual(res.getHeaders(), { 'Content-Type': 'application/json', 'Contnet-Length': Buffer.byteLength(str) })
  t.deepEqual(buf.toString('utf8'), str)
})

test.todo('handler deals with buffers as file content')
