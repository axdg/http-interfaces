const test = require('ava')
const { Readable, Writable } = require('stream')
const { createIncomingMessage, createServerResponse, METHODS } = require('../src/index.js')

const RESOURCE = 'http"//x.io'
const CONTENTS = 'stream contents'
const STATUS_TEXT = 'All Good!'

test('`incomingMessage` interface is correct / consistent', async function (t) {
  /**
   * TODO: The incoming message needs to support the passing of a stream
   * it presently only supports the passing of strings and buffers...
   *
   * It also needs to support generating an incoming message in the same
   * manor in which one would generate a fetch request.
   */
  const incomingMessage = createIncomingMessage(CONTENTS)
  incomingMessage.url = RESOURCE
  incomingMessage.method = METHODS.POST

  // Assert that it's a readable stream.
  t.true(incomingMessage instanceof Readable)

  // Allows for content buffering.
  const contents = await incomingMessage.buffer().then(b => b.toString())
  t.true(incomingMessage.method === METHODS.POST)
  t.true(incomingMessage.url === RESOURCE)
  t.true(contents === CONTENTS)
})

test('`serverResponse` interface is correct / consistent', async function (t) {
  const serverResponse = createServerResponse()

  const contents = Buffer.from(CONTENTS)
  const length = Buffer.byteLength(contents)

  // Write some headers - asserting that the method exists.
  serverResponse.writeHead(200, STATUS_TEXT, {
    'Content-Length': length,
    'Content-Type': 'application/octet-stream',
  })

 // Asserting that it implements the `end` and `write` methods
 serverResponse.write(CONTENTS)
 serverResponse.end()

  // Assert that this is a writable stream.
  t.true(serverResponse instanceof Writable)

  const str = await serverResponse.buffer().then(b => b.toString())
  const { headers } = serverResponse

  // Some extra assertions.

  t.true(headers['Content-Length'] === length)
  t.true(headers['Content-Type'] === 'application/octet-stream')
  t.true(serverResponse.status === 200)
  t.true(serverResponse.statusText === STATUS_TEXT)
  t.true(str === CONTENTS)
})

test.todo('some example of a complex assertion passes')
