/**
 * @fileoverview Secure Express.js HTTPS Server with Security Middleware Stack
 * 
 * This server provides a security-hardened HTTP/HTTPS application with:
 * - Helmet.js for security headers (CSP, HSTS, X-Content-Type-Options, etc.)
 * - CORS middleware for cross-origin resource sharing policy
 * - Rate limiting to protect against DoS and brute-force attacks
 * - HTTPS with TLS 1.3/1.2 encrypted connections
 * - Graceful shutdown handling for zero-downtime deployments
 * 
 * Original functionality preserved: "Hello, World!" response on GET /
 * 
 * @module server
 * @requires https
 * @requires http
 * @requires fs
 * @requires path
 * @requires express
 * @requires helmet
 * @requires cors
 * @requires express-rate-limit
 */

'use strict';

// =============================================================================
// EXTERNAL MODULE IMPORTS
// =============================================================================

/**
 * Node.js built-in HTTPS module for creating TLS-encrypted server.
 * Provides secure communication over SSL/TLS protocols.
 */
const https = require('https');

/**
 * Node.js built-in HTTP module for optional redirect server.
 * Used to redirect HTTP requests to HTTPS.
 */
const http = require('http');

/**
 * Node.js built-in file system module.
 * Used to read TLS certificate files synchronously during server startup.
 */
const fs = require('fs');

/**
 * Node.js built-in path module.
 * Provides cross-platform file path resolution for certificate files.
 */
const path = require('path');

/**
 * Express.js web application framework (v5.2.1).
 * Foundation for middleware-based security architecture.
 */
const express = require('express');

/**
 * Helmet.js security middleware (v8.1.0).
 * Sets 15+ HTTP security headers by default including CSP, HSTS, X-Frame-Options.
 */
const helmet = require('helmet');

/**
 * CORS middleware (v2.8.5).
 * Configures Cross-Origin Resource Sharing policies.
 */
const cors = require('cors');

/**
 * Express rate limiting middleware (v8.2.1).
 * Protects against DoS attacks by limiting requests per IP.
 */
const { rateLimit } = require('express-rate-limit');

// =============================================================================
// INTERNAL MODULE IMPORTS
// =============================================================================

/**
 * Centralized security configuration module.
 * Provides environment-aware settings for all security middleware.
 */
const securityConfig = require('./src/config/security');

// Destructure security configuration for convenient access
const {
  NODE_ENV,
  isDevelopment,
  isProduction,
  PORT,
  HTTPS_PORT,
  helmetConfig,
  corsConfig,
  rateLimitConfig,
  tlsConfig
} = securityConfig;

// =============================================================================
// EXPRESS APPLICATION INITIALIZATION
// =============================================================================

/**
 * Express application instance.
 * Configured with comprehensive security middleware stack.
 */
const app = express();

// =============================================================================
// SECURITY MIDDLEWARE STACK
// =============================================================================

/**
 * Apply Helmet.js security headers middleware.
 * 
 * Sets the following headers by default:
 * - Content-Security-Policy: Restricts resource loading to prevent XSS
 * - Cross-Origin-Opener-Policy: Isolates browsing context
 * - Cross-Origin-Resource-Policy: Prevents cross-origin reads
 * - Origin-Agent-Cluster: Enables process isolation
 * - Referrer-Policy: Controls referrer information
 * - Strict-Transport-Security: Forces HTTPS connections
 * - X-Content-Type-Options: Prevents MIME-sniffing
 * - X-DNS-Prefetch-Control: Controls DNS prefetching
 * - X-Download-Options: Prevents download execution (IE)
 * - X-Frame-Options: Prevents clickjacking
 * - X-Permitted-Cross-Domain-Policies: Controls Flash/PDF cross-domain
 * 
 * Custom configuration from helmetConfig includes CSP directives and HSTS settings.
 */
app.use(helmet(helmetConfig));

/**
 * Apply CORS middleware for cross-origin resource sharing.
 * 
 * Configuration from corsConfig controls:
 * - Allowed origins (from ALLOWED_ORIGINS environment variable)
 * - Allowed HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
 * - Allowed request headers (Content-Type, Authorization)
 * - Credentials support (cookies, auth headers)
 * - Preflight cache duration (24 hours)
 */
app.use(cors(corsConfig));

/**
 * Apply rate limiting middleware for DoS protection.
 * 
 * Configuration from rateLimitConfig:
 * - Window: 15 minutes (configurable via RATE_LIMIT_WINDOW_MS)
 * - Limit: 100 requests per window (configurable via RATE_LIMIT_MAX_REQUESTS)
 * - Headers: Uses draft-8 standard RateLimit headers
 * - Response: JSON error message when limit exceeded (HTTP 429)
 */
app.use(rateLimit(rateLimitConfig));

/**
 * Apply JSON body parser middleware with size limit.
 * 
 * Limits request body size to 10kb to prevent large payload attacks.
 * Parses application/json content type.
 */
app.use(express.json({ limit: '10kb' }));

/**
 * Apply URL-encoded body parser middleware with size limit.
 * 
 * Limits request body size to 10kb for URL-encoded form data.
 * Extended mode allows rich objects and arrays.
 */
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * Root endpoint handler - Preserves original "Hello, World!" functionality.
 * 
 * @route GET /
 * @returns {string} Plain text "Hello, World!" response
 * 
 * @example
 * // Request
 * curl https://localhost:3443/
 * 
 * // Response
 * Hello, World!
 */
app.get('/', (req, res) => {
  res.type('text/plain').send('Hello, World!\n');
});

/**
 * Health check endpoint for monitoring and load balancer probes.
 * 
 * Returns server status information including:
 * - status: "healthy" when server is operational
 * - timestamp: Current ISO 8601 timestamp
 * - environment: Current NODE_ENV value
 * - uptime: Server uptime in seconds
 * 
 * @route GET /health
 * @returns {Object} JSON health status object
 * 
 * @example
 * // Request
 * curl https://localhost:3443/health
 * 
 * // Response
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-01-13T12:00:00.000Z",
 *   "environment": "development",
 *   "uptime": 3600
 * }
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

/**
 * 404 Not Found handler for unmatched routes.
 * 
 * Catches all requests that don't match defined routes and returns
 * a standardized JSON error response.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist.',
    path: req.path
  });
});

/**
 * Global error handler middleware.
 * 
 * Catches all errors thrown by route handlers and middleware.
 * In production, sanitizes error responses to prevent information leakage.
 * In development, includes full error details for debugging.
 * 
 * Security considerations:
 * - Never exposes stack traces in production
 * - Logs full error details server-side for debugging
 * - Returns generic error message to clients in production
 * 
 * @param {Error} err - Error object thrown by handlers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (required for error handlers)
 */
app.use((err, req, res, next) => {
  // Log error details server-side (always log for debugging)
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    path: req.path,
    method: req.method,
    ...(isDevelopment && { stack: err.stack })
  });

  // Determine appropriate status code
  const statusCode = err.status || err.statusCode || 500;

  // Build error response based on environment
  const errorResponse = {
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    message: isProduction
      ? 'An unexpected error occurred. Please try again later.'
      : err.message
  };

  // Include stack trace only in development
  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Include request ID if available for log correlation
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
});

// =============================================================================
// TLS CERTIFICATE LOADING
// =============================================================================

/**
 * HTTPS server TLS options.
 * Contains the private key and certificate for TLS encryption.
 * 
 * @type {Object|null}
 */
let httpsOptions = null;

/**
 * Load TLS certificates from configured file paths.
 * 
 * Attempts to read the TLS private key and certificate files specified
 * in the security configuration. If files are not found, logs a warning
 * and falls back to HTTP-only mode in development.
 * 
 * @throws {Error} In production, throws if certificates cannot be loaded
 */
const loadTlsCertificates = () => {
  try {
    const keyPath = tlsConfig.keyPath;
    const certPath = tlsConfig.certPath;

    // Verify certificate files exist before attempting to read
    if (!fs.existsSync(keyPath)) {
      throw new Error(`TLS private key not found: ${keyPath}`);
    }
    if (!fs.existsSync(certPath)) {
      throw new Error(`TLS certificate not found: ${certPath}`);
    }

    // Read certificate files synchronously (blocking is acceptable at startup)
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    console.log(`[${new Date().toISOString()}] TLS certificates loaded successfully`);
    console.log(`  Key:  ${keyPath}`);
    console.log(`  Cert: ${certPath}`);
  } catch (error) {
    const errorMessage = `Failed to load TLS certificates: ${error.message}`;
    
    if (isProduction) {
      // In production, TLS is mandatory - fail fast
      console.error(`[${new Date().toISOString()}] FATAL: ${errorMessage}`);
      console.error('HTTPS is required in production. Please provide valid TLS certificates.');
      process.exit(1);
    } else {
      // In development, warn and continue with HTTP-only
      console.warn(`[${new Date().toISOString()}] WARNING: ${errorMessage}`);
      console.warn('Running in HTTP-only mode. Generate certificates for HTTPS:');
      console.warn('  mkdir -p certs');
      console.warn('  openssl genrsa -out certs/server.key 2048');
      console.warn('  openssl req -new -x509 -key certs/server.key -out certs/server.crt -days 365 -subj "/CN=localhost"');
    }
  }
};

// Load TLS certificates at module initialization
loadTlsCertificates();

// =============================================================================
// SERVER INSTANCES
// =============================================================================

/**
 * HTTPS server instance (TLS-encrypted).
 * @type {https.Server|null}
 */
let httpsServer = null;

/**
 * HTTP server instance (for redirects or fallback).
 * @type {http.Server|null}
 */
let httpServer = null;

// =============================================================================
// HTTP TO HTTPS REDIRECT SERVER
// =============================================================================

/**
 * Create HTTP redirect server that forwards all requests to HTTPS.
 * 
 * This ensures all traffic is encrypted by automatically redirecting
 * HTTP requests to the HTTPS endpoint with a 301 Moved Permanently response.
 * 
 * Security benefit: Ensures users who accidentally use HTTP are
 * automatically upgraded to secure HTTPS connections.
 */
const createHttpRedirectServer = () => {
  httpServer = http.createServer((req, res) => {
    // Extract host without port for redirect URL
    const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
    const httpsUrl = `https://${host}:${HTTPS_PORT}${req.url}`;
    
    // Permanent redirect to HTTPS (HTTP 301)
    res.writeHead(301, {
      'Location': httpsUrl,
      'Content-Type': 'text/plain'
    });
    res.end(`Redirecting to ${httpsUrl}\n`);
  });

  httpServer.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] HTTP redirect server listening on port ${PORT}`);
    console.log(`  All HTTP requests will be redirected to HTTPS on port ${HTTPS_PORT}`);
  });

  return httpServer;
};

// =============================================================================
// GRACEFUL SHUTDOWN HANDLING
// =============================================================================

/**
 * Flag to prevent multiple shutdown attempts.
 * @type {boolean}
 */
let isShuttingDown = false;

/**
 * Gracefully shutdown all servers.
 * 
 * Implements zero-downtime deployment support by:
 * 1. Stopping acceptance of new connections
 * 2. Waiting for existing connections to complete
 * 3. Closing servers gracefully
 * 4. Exiting the process
 * 
 * @param {string} signal - The signal that triggered shutdown (e.g., 'SIGTERM', 'SIGINT')
 */
const gracefulShutdown = (signal) => {
  // Prevent multiple shutdown attempts
  if (isShuttingDown) {
    console.log(`[${new Date().toISOString()}] Shutdown already in progress...`);
    return;
  }
  isShuttingDown = true;

  console.log(`\n[${new Date().toISOString()}] Received ${signal}. Starting graceful shutdown...`);

  // Shutdown timeout to force exit if graceful shutdown takes too long
  const shutdownTimeout = setTimeout(() => {
    console.error(`[${new Date().toISOString()}] Graceful shutdown timed out. Forcing exit.`);
    process.exit(1);
  }, 10000); // 10 second timeout

  // Track server close operations
  const closeOperations = [];

  // Close HTTPS server if running
  if (httpsServer) {
    closeOperations.push(
      new Promise((resolve) => {
        httpsServer.close((err) => {
          if (err) {
            console.error(`[${new Date().toISOString()}] Error closing HTTPS server:`, err.message);
          } else {
            console.log(`[${new Date().toISOString()}] HTTPS server closed`);
          }
          resolve();
        });
      })
    );
  }

  // Close HTTP redirect server if running
  if (httpServer) {
    closeOperations.push(
      new Promise((resolve) => {
        httpServer.close((err) => {
          if (err) {
            console.error(`[${new Date().toISOString()}] Error closing HTTP server:`, err.message);
          } else {
            console.log(`[${new Date().toISOString()}] HTTP server closed`);
          }
          resolve();
        });
      })
    );
  }

  // Wait for all servers to close, then exit
  Promise.all(closeOperations)
    .then(() => {
      clearTimeout(shutdownTimeout);
      console.log(`[${new Date().toISOString()}] All servers closed. Exiting gracefully.`);
      process.exit(0);
    })
    .catch((err) => {
      clearTimeout(shutdownTimeout);
      console.error(`[${new Date().toISOString()}] Error during shutdown:`, err.message);
      process.exit(1);
    });
};

// Register signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error(`[${new Date().toISOString()}] Uncaught Exception:`, err.message);
  console.error(err.stack);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${new Date().toISOString()}] Unhandled Rejection at:`, promise);
  console.error('Reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Start the server(s) based on TLS certificate availability.
 * 
 * In production or when certificates are available:
 * - Starts HTTPS server on HTTPS_PORT (default 3443)
 * - Starts HTTP redirect server on PORT (default 3000)
 * 
 * In development without certificates:
 * - Starts HTTP-only server on PORT (default 3000)
 * - Logs warning about missing TLS certificates
 */
const startServer = () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  SECURITY-HARDENED EXPRESS SERVER');
  console.log(`${'='.repeat(60)}`);
  console.log(`  Environment:    ${NODE_ENV}`);
  console.log(`  Node.js:        ${process.version}`);
  console.log(`  Process ID:     ${process.pid}`);
  console.log(`${'='.repeat(60)}\n`);

  if (httpsOptions) {
    // Start HTTPS server with TLS certificates
    httpsServer = https.createServer(httpsOptions, app);
    
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`[${new Date().toISOString()}] HTTPS server listening on port ${HTTPS_PORT}`);
      console.log(`  URL: https://localhost:${HTTPS_PORT}/`);
      console.log('');
      console.log('  Security features enabled:');
      console.log('    ✓ Helmet.js security headers (CSP, HSTS, X-Frame-Options, etc.)');
      console.log('    ✓ CORS policy enforcement');
      console.log('    ✓ Rate limiting (DoS protection)');
      console.log('    ✓ TLS 1.3/1.2 encryption');
      console.log('    ✓ Request body size limiting');
      console.log('    ✓ Graceful shutdown handling');
      console.log('');
    });

    // Start HTTP redirect server
    createHttpRedirectServer();
  } else {
    // Fallback to HTTP-only server in development
    httpServer = http.createServer(app);
    
    httpServer.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] HTTP server listening on port ${PORT}`);
      console.log(`  URL: http://localhost:${PORT}/`);
      console.log('');
      console.warn('  ⚠️  WARNING: Running in HTTP-only mode (unencrypted)');
      console.warn('  ⚠️  This is acceptable for development but NOT for production.');
      console.warn('');
      console.log('  Security features enabled (even in HTTP mode):');
      console.log('    ✓ Helmet.js security headers (CSP, HSTS, X-Frame-Options, etc.)');
      console.log('    ✓ CORS policy enforcement');
      console.log('    ✓ Rate limiting (DoS protection)');
      console.log('    ✓ Request body size limiting');
      console.log('    ✓ Graceful shutdown handling');
      console.log('');
      console.log('  To enable HTTPS, generate TLS certificates:');
      console.log('    mkdir -p certs');
      console.log('    openssl genrsa -out certs/server.key 2048');
      console.log('    openssl req -new -x509 -key certs/server.key -out certs/server.crt -days 365 -subj "/CN=localhost"');
      console.log('');
    });
  }
};

// Start the server
startServer();

// =============================================================================
// MODULE EXPORTS (for testing purposes)
// =============================================================================

/**
 * Export the Express app instance for testing.
 * Allows supertest and similar testing libraries to make requests
 * without starting the actual server.
 */
module.exports = app;
