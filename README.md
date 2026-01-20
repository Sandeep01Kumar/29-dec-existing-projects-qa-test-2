# Hello World Node.js Server

A simple HTTP server built with Express.js framework, enhanced with comprehensive security middleware.

## Overview

This is a tutorial project demonstrating Node.js server hosting with Express.js. The server provides two HTTP endpoints that return greeting responses, protected by industry-standard security middleware.

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

## Security Configuration

The application includes built-in security features powered by industry-standard middleware:

### Security Features

| Feature | Package | Description |
|---------|---------|-------------|
| Security Headers | helmet@8.1.0 | Sets 13 security HTTP headers |
| CORS | cors@2.8.5 | Cross-Origin Resource Sharing control |
| Rate Limiting | express-rate-limit@8.2.1 | DoS protection |
| Input Validation | express-validator@7.3.1 | Request validation support |

### Security Headers (Helmet.js)

Helmet.js automatically sets the following headers:
- `Content-Security-Policy` - Restricts resources the browser can load
- `X-Frame-Options` - Prevents clickjacking
- `X-Content-Type-Options` - Prevents MIME type sniffing
- `Strict-Transport-Security` - Enforces HTTPS connections
- `X-DNS-Prefetch-Control` - Controls DNS prefetching
- `X-Download-Options` - Prevents Internet Explorer from executing downloads
- `X-Permitted-Cross-Domain-Policies` - Restricts cross-domain policies
- `Referrer-Policy` - Controls Referer header behavior
- `Cross-Origin-Opener-Policy` - Protects against cross-origin attacks
- `Cross-Origin-Resource-Policy` - Controls cross-origin resource loading
- `Origin-Agent-Cluster` - Isolates browsing context

Additionally, Helmet removes the `X-Powered-By` header to prevent technology fingerprinting.

### Rate Limiting

Default configuration:
- **Window**: 15 minutes (900,000 ms)
- **Limit**: 100 requests per IP per window
- **Status Code**: 429 (Too Many Requests) when exceeded

### CORS Policy

Default: Deny all cross-origin requests (most restrictive)

### Environment Variables

Copy `.env.example` to `.env` and customize:

| Variable | Default | Description |
|----------|---------|-------------|
| SECURITY_ENABLED | true | Master toggle for security middleware |
| HTTPS_ENABLED | false | Enable HTTPS server |
| SSL_KEY_PATH | ./certs/key.pem | Path to SSL private key |
| SSL_CERT_PATH | ./certs/cert.pem | Path to SSL certificate |
| CORS_ORIGINS | (empty) | Comma-separated allowed origins |
| RATE_WINDOW_MS | 900000 | Rate limit window in milliseconds |
| RATE_LIMIT | 100 | Max requests per window per IP |

### Disabling Security (Development Only)

To disable all security middleware for development:
```bash
SECURITY_ENABLED=false node server.js
```

**Warning**: Never disable security in production environments.

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
- **helmet** (^8.1.0) - Security headers middleware
- **cors** (^2.8.5) - Cross-Origin Resource Sharing middleware
- **express-rate-limit** (^8.2.1) - Rate limiting middleware
- **express-validator** (^7.3.1) - Input validation middleware

### Development Dependencies
- **jest** (^29.7.0) - JavaScript testing framework
- **supertest** (^7.1.0) - HTTP assertions for testing Express.js applications

## License

MIT
