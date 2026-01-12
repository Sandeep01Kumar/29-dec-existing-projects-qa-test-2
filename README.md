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

## Dependencies

- **express** (^5.2.1) - Fast, unopinionated, minimalist web framework for Node.js

## License

MIT
