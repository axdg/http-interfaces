# http-interfaces

[![CircleCI](https://circleci.com/gh/axdg/http-interfaces.svg?style=shield)](https://circleci.com/gh/axdg/http-interfaces) [![Build Status](https://semaphoreci.com/api/v1/axdg/http-interfaces/branches/master/shields_badge.svg)](https://semaphoreci.com/axdg/http-interfaces)

## Usage

**WIP: *usage example coming***

This module creates mock `incomingMessage` and `serverResponse` interfaces - although it's still very much a **WIP** it's designed to allow testing of functions that interact with  the http **or** https **or** http\2 `ServerResponse` and `IncomingMessage` like interfaces by exposing mocks for them that also implement a set of features from the [HTML5 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) interface.

The basic idea is that you can create an `IncomingMessage` instance using the same parameters that you'd pass to [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch) on the client side, as well and read data from a generated `ServerResponse` instance using the same API that you'd use to interface with an [HTML 5 `Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) instance.

## API

**WIP: *documentation is not complete***

### createServerResponse()

Returns a `serverResponse` (`object` && `stream.Writable`) - a `ServerResponse`-ish and HTML5 `Response`-ish instance.

**serverResponse (presently implemented methods and properties)**

- **write()**
- **end()**
- **writeHead()**
- **setHeader()**
- **getHeader()**
- **statusCode**
- **statusMessage**

- **buffer()** *used instead of `.blob()`*
- **status**
- **statusText**
- **ok**

### createIncomingMessage(*/fetch-ish parameters/*)

**incomingMessage**

- **read()**
- **pipe()**
- **method**
- **url**

Returns an `incomingMessage` (`object` && `stream.Readable`) a `IncomingMessage`-ish and HTML5 `Response`-ish instance)**

## LICENSE

&copy; axdg &bull; ([axdg@dfant.asia](mailto:axdg@dfant.asia))  &bull; 2017
