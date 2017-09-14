const test = require('ava')
const { createIncomingMessage, createServerResponse } = require('../src/index.js')

test('incoming messsage generation', function (t) {
  const req = createIncomingMessage()
  console.log(req)
})
