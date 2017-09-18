# http-interfaces

[![CircleCI](https://circleci.com/gh/axdg/http-interfaces.svg?style=shield)](https://circleci.com/gh/axdg/http-interfaces) [![Build Status](https://semaphoreci.com/api/v1/axdg/http-interfaces/branches/master/shields_badge.svg)](https://semaphoreci.com/axdg/http-interfaces)

## Usage

**WIP: *usage example coming***

This module creates mock `incomingMessage` and `serverResponse` interfaces - although it's still very much a **WIP** it's designed to allow testing of functions that interact with  the `http(s || \2)` `ServerResponse` and `IncomingMessage` like interfaces by exposing mocks for them that also implement a set of features from the [HTML5 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) interface.

## API

**WIP: *documentation coming***

### createServerResponse()

Returns a `serverResponse` (`object` && `stream.Writable`) - a `ServerResponse`-ish and HTML5 `Response`-ish instance.

**serverResponse**

- **write**
- **writeHead**
- **end** *etc...*

### createIncomingMessage(*/fetch-ish parameters/*)

**incomingMessage**

- **read** *etc...*

Returns an `incomingMessage` (`object` && `stream.Readable`) a `IncomingMessage`-ish and HTML5 `Response`-ish instance)**

## LICENSE

&copy; axdg &bull; ([axdg@dfant.asia](mailto:axdg@dfant.asia))  &bull; 2017
