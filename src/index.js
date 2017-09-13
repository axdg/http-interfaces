const { STATUS_CODES } = require('http')
const puppeteer = require('puppeteer')

/**
 * A utility to create an async handler.
 *
 * NOTE: The functions here are capable of serving either pretty JSON or
 * files (as a Node `Buffer`), so these are the only situations that we
 * deal with in this handler creator.
 *
 * @param {Function}
 * @param {Request}
 * @param {Response}
 * @returns {Function}
 */
const createHandler = function (fn) {
  return async function (req, res) {
    try {
      const data = await fn(req, res)

      console.log(data)

      // We're retusrning a file of some sort... set headers etc.
      if (Buffer.isBuffer(data)) {
        if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Length', data.length)
        res.writeHead(200, STATUS_CODES[200], { 'Content-Length': data.length })
        return res.end(data)
      }

      // Returning a JSON response... set encoding etc.
      if (typeof data === 'object') {
        console.log(true)
        let str
        // Set encoding etc...
        try {
          str = JSON.stringify(data, null, 2)
        } catch (err) {
          throw createError(400, 'I can\'t parse that JSON :(')
        }

        res.writeHead(200, STATUS_CODES[200], {
          'Content-Type': 'application/json',
          'Contnet-Length': Buffer.byteLength(str)
        })

        return res.end(str)
      }

      return undefined
    } catch (err) {
      const { statusCode, message } = err
      const statusText = STATUS_CODES[statusCode]

      const str = JSON.stringify({ statusCode, statusText, message }, null, 2)

      // Send the error... set the status code \_(ツ)_/¯
      res.writeHead(statusCode, statusText, {
        'Content-Type': 'application/json',
        'Contnet-Length': Buffer.byteLength(str)
      })

      return res.end(str)
    }
  }
}

exports.createHandler = createHandler

/**
 * It helps to be able to standardise around some sort of error object.
 *
 * @param {Number}
 * @param {String}
 * @returns {Error}
 */
const createError = function (statusCode, message) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

/**
 * Buffers the body of a post message.
 *
 * TODO: Can buffer be called multiple times? It shouldn't
 * be (ideally), but would it work if it was?
 *
 * @param {Request}
 * @param {Number}
 * @param {String}
 * @returns {Promise}
 */
const buffer = function (readable, limit = 100000/** default is 100kb */) {
  const chunks = []
  let len = 0

  return new Promise(function (resolve, reject) {
    readable.on('data', function (chunk) {
      len += chunk.length

      /**
       * Don't allow the body limit to be exceeded.
       *
       * TODO: Make the string containing byte length prettier.
       */
      if (len > limit) return reject(createError(400, `Body limit of ${limit} bytes exceeded`))

      return chunks.push(chunk)
    })

    readable.on('error', function () {
      return reject(createError(400, '¯\_(ツ)_/¯'))
    })

    readble.on('end', async function () {
      let data

      try {
        data = JSON.parse(Buffer.concat(chunks, len).toString('utf8'))
      } catch (err) {
        return reject(createError(400, 'JSON parsing error :('))
      }

      return resolve(data)
    })
  })
}

exports.buffer = buffer

/**
 * Render a `.pdf` file... needs to accept options.
 *
 * @param {Request}
 * @param {Response}
 */
exports['render-portable-document'] = createHandler(async function (req, res) {})

/**
 * Capture a screenshot of a web page.
 *
 * @param {Request}
 * @param {Response}
 */
exports['render-screenshot'] = async function (req, res) {}

/**
 * Render an HTML5 document.
 *
 * @param {Request}
 * @param {Response}
 */
exports['render-markup'] = async function (req, res) {}

/**
 * Parse an HTML5 document.
 *
 * @param {Request}
 * @param {Response}
 */
exports['parse-markup'] = async function (req, res) {}

/**
 * Parse a bitmap using the canvas API.
 *
 * @param {Request}
 * @param {Response}
 */
exports['parse-bitmap-image'] = async function (req, res) {}

/**
 * Render a GH stats as a markup document ;)
 *
 * @param {Request}
 * @param {Response}
 */
exports['render-gh-stats-markup'] = async function (req, res) {}

/**
 * Render a GH stats as a printable document ;)
 *
 * @param {Request}
 * @param {Response}
 */
exports['render-gh-stats-document'] = async function (req, res) {}
