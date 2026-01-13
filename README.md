# Hello World Node.js Server

A simple HTTP server built with Express.js framework.

## Overview

This is a tutorial project demonstrating Node.js server hosting with Express.js. The server provides two HTTP endpoints that return greeting responses.

## Prerequisites

- Node.js v18 or higher
- npm package manager

## Installation

```bash
npm install
```

## Running the Server

```bash
node server.js
```

The server will start and listen on `http://127.0.0.1:3000/`

## API Endpoints

### GET /

Returns a "Hello, World!" greeting.

**Request:**
```bash
curl http://127.0.0.1:3000/
```

**Response:**
```
Hello, World!
```

### GET /evening

Returns a "Good evening" greeting.

**Request:**
```bash
curl http://127.0.0.1:3000/evening
```

**Response:**
```
Good evening
```

## Server Configuration

| Setting   | Value        |
|-----------|--------------|
| Hostname  | 127.0.0.1    |
| Port      | 3000         |
| Framework | Express.js 5 |

## Testing

The project includes comprehensive unit tests using Jest and Supertest. To run the tests:

```bash
npm test
```

### Test Coverage

The test suite covers:
- **HTTP Responses**: Validates response content for all endpoints
- **Status Codes**: Verifies 200 OK for valid routes and 404 for invalid routes
- **Response Headers**: Tests Content-Type, Content-Length, ETag, and X-Powered-By headers
- **Server Startup/Shutdown**: Tests programmatic server control
- **Error Handling**: Tests 404 responses and invalid HTTP methods
- **Edge Cases**: Tests URL variations, query parameters, case sensitivity, concurrent requests

## Dependencies

### Production Dependencies
- **express** (^5.2.1) - Fast, unopinionated, minimalist web framework for Node.js

### Development Dependencies
- **jest** (^29.7.0) - JavaScript testing framework
- **supertest** (^7.1.0) - HTTP assertions for testing Express.js applications

## License

MIT
