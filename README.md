# Security-Hardened Node.js Application

A production-ready, security-hardened Node.js web application built with Express.js and comprehensive security middleware. This application demonstrates enterprise-grade security practices including HTTPS/TLS encryption, security headers, CORS policies, rate limiting, and input validation.

## Table of Contents

- [Security Features](#security-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Server](#running-the-server)
- [Security Headers](#security-headers)
- [API Endpoints](#api-endpoints)
- [TLS Certificate Generation](#tls-certificate-generation)
- [Security Testing](#security-testing)
- [License](#license)

## Security Features

This application implements comprehensive security controls following OWASP best practices:

### Helmet.js Security Headers

Helmet.js v8.1.0 automatically sets 15+ HTTP security headers including:

- **Content-Security-Policy (CSP)**: Prevents XSS attacks by controlling resource loading
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Content-Type-Options**: Prevents MIME-type sniffing attacks
- **X-Frame-Options**: Protects against clickjacking
- **Cross-Origin-Opener-Policy**: Isolates browsing context
- **Cross-Origin-Resource-Policy**: Controls cross-origin resource access
- **Referrer-Policy**: Controls referrer information leakage
- **X-DNS-Prefetch-Control**: Controls DNS prefetching behavior

### CORS Configuration

Cross-Origin Resource Sharing (CORS) v2.8.5 middleware with:

- Configurable origin whitelist via environment variables
- Restricted HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Controlled allowed headers (Content-Type, Authorization)
- Credentials support with secure defaults
- Preflight request caching (24 hours)

### Rate Limiting

Express-rate-limit v8.2.1 protects against DoS attacks:

- Default: 100 requests per 15-minute window per IP
- Configurable via environment variables
- Supports draft-8 rate limit headers
- Returns 429 Too Many Requests when exceeded
- IPv6 subnet masking support

### HTTPS/TLS Support

Node.js native HTTPS module with secure TLS configuration:

- TLS 1.3 preferred with TLS 1.2 fallback
- Secure default cipher suites (GCM, ECDHE)
- Self-signed certificate support for development
- Production-ready certificate configuration

### Input Validation

Express-validator v7.3.1 provides comprehensive input validation:

- Request body validation and sanitization
- Protection against injection attacks
- Custom validation chains
- Detailed error responses

## Prerequisites

Before running this application, ensure you have:

| Requirement | Minimum Version | Purpose |
|-------------|-----------------|---------|
| Node.js | ≥18.0.0 | Runtime environment |
| npm | ≥9.0.0 | Package manager |
| OpenSSL | Any recent version | TLS certificate generation |

Verify your Node.js version:

```bash
node --version
# Should output v18.0.0 or higher
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

This installs the following security packages:

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework with middleware support |
| helmet | ^8.1.0 | Security headers middleware |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| express-rate-limit | ^8.2.1 | Rate limiting middleware |
| express-validator | ^7.3.1 | Input validation middleware |

### 3. Generate TLS Certificates

For development, generate self-signed certificates:

```bash
# Create certificates directory
mkdir -p certs

# Generate private key (2048-bit RSA)
openssl genrsa -out certs/server.key 2048

# Generate self-signed certificate (valid 365 days)
openssl req -new -x509 -key certs/server.key \
  -out certs/server.crt -days 365 \
  -subj "/CN=localhost/O=Development/C=US"
```

### 4. Configure Environment

Copy the example environment file and configure:

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `PORT` | `3000` | HTTP server port (used for redirect in production) |
| `HTTPS_PORT` | `3443` | HTTPS server port |

### Security Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | (empty) | Comma-separated list of allowed CORS origins |

### Rate Limiting Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in milliseconds (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Maximum requests per window per IP |

### TLS Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TLS_KEY_PATH` | `./certs/server.key` | Path to TLS private key file |
| `TLS_CERT_PATH` | `./certs/server.crt` | Path to TLS certificate file |

### Example .env File

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HTTPS_PORT=3443

# Security Configuration
ALLOWED_ORIGINS=https://localhost:3443,https://example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# TLS Configuration (paths relative to project root)
TLS_KEY_PATH=./certs/server.key
TLS_CERT_PATH=./certs/server.crt
```

## Running the Server

### Development Mode

Start the server in development mode with self-signed certificates:

```bash
NODE_ENV=development npm start
```

Or simply:

```bash
npm start
```

The server will be available at:
- **HTTPS**: `https://localhost:3443`

> **Note**: Your browser will show a certificate warning for self-signed certificates. This is expected in development. Click "Advanced" and proceed to accept the certificate.

### Production Mode

For production deployment:

1. Obtain valid TLS certificates from a Certificate Authority (e.g., Let's Encrypt)
2. Update `TLS_KEY_PATH` and `TLS_CERT_PATH` environment variables
3. Configure `ALLOWED_ORIGINS` with your domain(s)
4. Start the server:

```bash
NODE_ENV=production npm start
```

## Security Headers

The application uses Helmet.js to set the following security headers:

### Headers Set by Default

| Header | Value | Protection |
|--------|-------|------------|
| Content-Security-Policy | `default-src 'self'` | XSS, data injection |
| Cross-Origin-Opener-Policy | `same-origin` | Cross-origin isolation |
| Cross-Origin-Resource-Policy | `same-origin` | Resource leakage |
| Origin-Agent-Cluster | `?1` | Process isolation |
| Referrer-Policy | `no-referrer` | Information leakage |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | Protocol downgrade |
| X-Content-Type-Options | `nosniff` | MIME sniffing |
| X-DNS-Prefetch-Control | `off` | DNS leakage |
| X-Download-Options | `noopen` | IE file execution |
| X-Frame-Options | `DENY` | Clickjacking |
| X-Permitted-Cross-Domain-Policies | `none` | Adobe cross-domain |

### Headers Removed

| Header | Reason |
|--------|--------|
| X-Powered-By | Prevents server fingerprinting |

### Custom CSP Configuration

The Content-Security-Policy is configured with:

```javascript
{
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    upgradeInsecureRequests: []
  }
}
```

## API Endpoints

### GET /

Returns a simple greeting message.

**Request:**
```bash
curl -k https://localhost:3443/
```

**Response:**
```
Hello, World!
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Successful response |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### Response Headers Example

```http
HTTP/2 200
content-security-policy: default-src 'self';script-src 'self';style-src 'self' 'unsafe-inline';img-src 'self' data:;upgrade-insecure-requests
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
origin-agent-cluster: ?1
referrer-policy: no-referrer
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-dns-prefetch-control: off
x-download-options: noopen
x-frame-options: DENY
x-permitted-cross-domain-policies: none
content-type: text/plain; charset=utf-8
ratelimit-limit: 100
ratelimit-remaining: 99
ratelimit-reset: 899
```

## TLS Certificate Generation

### Development (Self-Signed)

Generate self-signed certificates for local development:

```bash
# Create certificates directory
mkdir -p certs

# Generate 2048-bit RSA private key
openssl genrsa -out certs/server.key 2048

# Generate self-signed X.509 certificate (valid 365 days)
openssl req -new -x509 \
  -key certs/server.key \
  -out certs/server.crt \
  -days 365 \
  -subj "/CN=localhost/O=Development/C=US"

# Verify certificate
openssl x509 -in certs/server.crt -text -noout
```

### Production (Let's Encrypt)

For production, use Let's Encrypt with Certbot:

```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

Update environment variables:

```bash
TLS_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
TLS_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### Certificate Security Best Practices

1. **Never commit certificates to version control** - Add `certs/` to `.gitignore`
2. **Use strong key sizes** - Minimum 2048-bit RSA or 256-bit ECDSA
3. **Rotate certificates regularly** - Let's Encrypt certificates expire in 90 days
4. **Protect private keys** - Set permissions to 600 (read/write owner only)

```bash
chmod 600 certs/server.key
```

## Security Testing

### Dependency Vulnerability Scan

Check for known vulnerabilities in dependencies:

```bash
# Run npm audit
npm audit

# Expected output: found 0 vulnerabilities

# Fix vulnerabilities automatically (if any)
npm audit fix

# View detailed report
npm audit --json
```

### Security Header Verification

Verify security headers are present:

```bash
# Check response headers
curl -k -I https://localhost:3443/

# Verify specific headers
curl -k -s -D - https://localhost:3443/ -o /dev/null | grep -i "strict-transport"
curl -k -s -D - https://localhost:3443/ -o /dev/null | grep -i "content-security-policy"
curl -k -s -D - https://localhost:3443/ -o /dev/null | grep -i "x-frame-options"
```

### Rate Limiting Test

Test rate limiting is working:

```bash
# Send 105 requests (exceeds 100 limit)
for i in {1..105}; do
  response=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3443/)
  echo "Request $i: HTTP $response"
done

# Requests 101+ should return 429
```

### TLS Configuration Test

Verify TLS configuration:

```bash
# Test TLS 1.3 connection
openssl s_client -connect localhost:3443 -tls1_3

# Test TLS 1.2 fallback
openssl s_client -connect localhost:3443 -tls1_2

# Show cipher suites
openssl s_client -connect localhost:3443 -cipher 'ALL' </dev/null 2>/dev/null | grep "Cipher"
```

### CORS Policy Test

Test CORS restrictions:

```bash
# Test with unauthorized origin (should fail)
curl -k -H "Origin: https://malicious.com" \
  -H "Access-Control-Request-Method: GET" \
  -I https://localhost:3443/

# Test with authorized origin (should succeed)
curl -k -H "Origin: https://localhost:3443" \
  -H "Access-Control-Request-Method: GET" \
  -I https://localhost:3443/
```

### Automated Security Tests

Run the security test suite:

```bash
# Run all security tests
npm test -- --testPathPattern=security

# Run specific test files
npm test -- tests/security/headers.test.js
npm test -- tests/security/rate-limit.test.js
npm test -- tests/security/cors.test.js
npm test -- tests/security/validation.test.js
```

### Online Security Scanners

After deploying to a public URL, test with:

| Scanner | URL | Tests |
|---------|-----|-------|
| Mozilla Observatory | https://observatory.mozilla.org | Security headers |
| SSL Labs | https://www.ssllabs.com/ssltest | TLS configuration |
| SecurityHeaders.com | https://securityheaders.com | Header analysis |

### Security Validation Checklist

- [ ] All Helmet headers present in response
- [ ] HTTPS server accessible on configured port
- [ ] Rate limiting returns 429 after limit exceeded
- [ ] CORS blocks unauthorized origins
- [ ] Input validation rejects malformed requests
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] TLS 1.3 negotiation successful
- [ ] "Hello, World!" response still works

## Troubleshooting

### Certificate Warnings in Browser

**Issue**: Browser shows "Your connection is not private"

**Solution**: For development, click "Advanced" and "Proceed to localhost (unsafe)". For production, use valid certificates from a Certificate Authority.

### EACCES Permission Denied

**Issue**: Cannot bind to port 443 or 3443

**Solution**: Use a port above 1024 or run with elevated privileges:

```bash
# Use port above 1024 (recommended)
HTTPS_PORT=3443 npm start

# Or run with sudo (not recommended)
sudo npm start
```

### Rate Limit Too Restrictive

**Issue**: Legitimate users are being rate limited

**Solution**: Increase limits via environment variables:

```bash
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

### CORS Blocking Requests

**Issue**: Cross-origin requests are being blocked

**Solution**: Add the origin to ALLOWED_ORIGINS:

```bash
ALLOWED_ORIGINS=https://localhost:3443,https://your-frontend.com
```

## License

This project is available under the MIT License.

---

## Additional Resources

- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Node.js TLS Documentation](https://nodejs.org/api/tls.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
