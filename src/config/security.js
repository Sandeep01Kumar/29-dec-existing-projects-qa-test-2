/**
 * @fileoverview Centralized Security Configuration Module
 * 
 * This module serves as the single source of truth for all security-related
 * settings in the application. It exports configuration objects for:
 * - Helmet.js (CSP directives, HSTS settings)
 * - CORS policy (allowed origins from environment variables)
 * - Rate limiting (window duration, max requests)
 * - TLS/HTTPS (certificate paths)
 * - Environment detection (development vs production)
 * 
 * All configuration is environment-aware and can be customized via environment
 * variables for different deployment scenarios.
 * 
 * @module src/config/security
 * @requires path
 */

'use strict';

const path = require('path');

// =============================================================================
// ENVIRONMENT DETECTION
// =============================================================================

/**
 * Current Node.js environment. Defaults to 'development' if not specified.
 * @constant {string}
 */
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Flag indicating if the application is running in development mode.
 * @constant {boolean}
 */
const isDevelopment = NODE_ENV === 'development';

/**
 * Flag indicating if the application is running in production mode.
 * @constant {boolean}
 */
const isProduction = NODE_ENV === 'production';

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

/**
 * HTTP server port. Can be customized via PORT environment variable.
 * @constant {number}
 */
const PORT = parseInt(process.env.PORT, 10) || 3000;

/**
 * HTTPS server port. Can be customized via HTTPS_PORT environment variable.
 * @constant {number}
 */
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT, 10) || 3443;

// =============================================================================
// HELMET.JS SECURITY HEADERS CONFIGURATION
// =============================================================================

/**
 * Helmet.js configuration object for security headers.
 * 
 * Configures the following security headers:
 * - Content-Security-Policy: Restricts resource loading to prevent XSS
 * - Strict-Transport-Security (HSTS): Forces HTTPS connections
 * - Referrer-Policy: Controls referrer information sent with requests
 * 
 * @constant {Object}
 * @property {Object} contentSecurityPolicy - CSP directives configuration
 * @property {Object} hsts - HTTP Strict Transport Security settings
 * @property {Object} referrerPolicy - Referrer policy configuration
 */
const helmetConfig = {
  /**
   * Content Security Policy directives.
   * Restricts where resources can be loaded from to mitigate XSS attacks.
   */
  contentSecurityPolicy: {
    directives: {
      /**
       * Default source for all content types not specified elsewhere.
       * 'self' restricts to same origin only.
       */
      defaultSrc: ["'self'"],
      
      /**
       * Allowed sources for JavaScript execution.
       * 'self' restricts scripts to same origin only.
       */
      scriptSrc: ["'self'"],
      
      /**
       * Allowed sources for CSS stylesheets.
       * Includes 'unsafe-inline' to allow inline styles for compatibility.
       * NOTE: In production, consider removing 'unsafe-inline' and using nonces.
       */
      styleSrc: ["'self'", "'unsafe-inline'"],
      
      /**
       * Allowed sources for images.
       * Includes 'data:' to allow base64-encoded images.
       */
      imgSrc: ["'self'", 'data:'],
      
      /**
       * Empty array signals that insecure requests should be upgraded to HTTPS.
       * This directive has no value and acts as a boolean flag.
       */
      upgradeInsecureRequests: []
    }
  },
  
  /**
   * HTTP Strict Transport Security (HSTS) configuration.
   * Instructs browsers to only connect via HTTPS.
   */
  hsts: {
    /**
     * Duration in seconds that the browser should remember to use HTTPS.
     * Set to 1 year (31536000 seconds) as recommended by OWASP.
     */
    maxAge: 31536000,
    
    /**
     * Apply HSTS to all subdomains.
     */
    includeSubDomains: true,
    
    /**
     * Allow inclusion in browser's HSTS preload list.
     * Requires submission to https://hstspreload.org/
     */
    preload: true
  },
  
  /**
   * Referrer-Policy header configuration.
   * Controls how much referrer information is sent with requests.
   */
  referrerPolicy: {
    /**
     * Send full referrer to same origin, origin-only to cross-origin,
     * and nothing when downgrading from HTTPS to HTTP.
     */
    policy: 'strict-origin-when-cross-origin'
  }
};

// =============================================================================
// CORS (CROSS-ORIGIN RESOURCE SHARING) CONFIGURATION
// =============================================================================

/**
 * Parses the ALLOWED_ORIGINS environment variable into an array.
 * Returns false if no origins are specified (blocks all cross-origin requests).
 * 
 * @private
 * @returns {string[]|boolean} Array of allowed origins or false
 */
const parseAllowedOrigins = () => {
  const originsEnv = process.env.ALLOWED_ORIGINS;
  
  if (!originsEnv || originsEnv.trim() === '') {
    // No origins specified - use restrictive default based on environment
    if (isDevelopment) {
      // Allow localhost origins in development for easier testing
      return ['http://localhost:3000', 'https://localhost:3443'];
    }
    // Block all cross-origin requests in production if not explicitly configured
    return false;
  }
  
  // Parse comma-separated origins, trim whitespace, filter empty strings
  return originsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
};

/**
 * CORS (Cross-Origin Resource Sharing) configuration object.
 * 
 * Controls which external domains can access the API and what methods/headers
 * are allowed for cross-origin requests.
 * 
 * @constant {Object}
 * @property {string[]|boolean} origin - Allowed origins or false to block all
 * @property {string[]} methods - Allowed HTTP methods for cross-origin requests
 * @property {string[]} allowedHeaders - Headers allowed in cross-origin requests
 * @property {boolean} credentials - Whether to allow credentials (cookies, auth)
 * @property {number} maxAge - Preflight cache duration in seconds
 */
const corsConfig = {
  /**
   * Allowed origins for cross-origin requests.
   * Parsed from ALLOWED_ORIGINS environment variable (comma-separated).
   * Defaults to false (no cross-origin) if not specified in production.
   */
  origin: parseAllowedOrigins(),
  
  /**
   * HTTP methods allowed for cross-origin requests.
   * Includes all standard REST methods plus OPTIONS for preflight.
   */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  /**
   * Headers that clients are allowed to send in cross-origin requests.
   * Content-Type for body encoding, Authorization for auth tokens.
   */
  allowedHeaders: ['Content-Type', 'Authorization'],
  
  /**
   * Allow credentials (cookies, authorization headers, TLS client certificates)
   * to be included in cross-origin requests.
   */
  credentials: true,
  
  /**
   * Cache duration for preflight requests in seconds.
   * Set to 24 hours (86400 seconds) to minimize preflight requests.
   */
  maxAge: 86400
};

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

/**
 * Rate limiter configuration object for express-rate-limit middleware.
 * 
 * Protects against denial-of-service attacks and brute-force attempts
 * by limiting the number of requests per IP address within a time window.
 * 
 * @constant {Object}
 * @property {number} windowMs - Time window in milliseconds
 * @property {number} limit - Maximum requests per window per IP
 * @property {string} standardHeaders - Rate limit info header format
 * @property {boolean} legacyHeaders - Whether to send legacy X-RateLimit headers
 * @property {Object} message - Response body when limit is exceeded
 */
const rateLimitConfig = {
  /**
   * Time window for rate limiting in milliseconds.
   * Default is 15 minutes (900000ms). Configurable via RATE_LIMIT_WINDOW_MS.
   */
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  
  /**
   * Maximum number of requests allowed per IP within the time window.
   * Default is 100 requests. Configurable via RATE_LIMIT_MAX_REQUESTS.
   */
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  
  /**
   * Use the latest draft-8 format for RateLimit headers.
   * Includes RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset.
   */
  standardHeaders: 'draft-8',
  
  /**
   * Disable legacy X-RateLimit-* headers for cleaner responses.
   * The standard headers above provide the same information.
   */
  legacyHeaders: false,
  
  /**
   * Response body sent when rate limit is exceeded (HTTP 429).
   * Returns a JSON object with an error message.
   */
  message: {
    error: 'Too many requests, please try again later.'
  }
};

// =============================================================================
// TLS/HTTPS CONFIGURATION
// =============================================================================

/**
 * TLS (Transport Layer Security) configuration for HTTPS server.
 * 
 * Specifies paths to the TLS private key and certificate files.
 * Paths are resolved relative to the project root directory.
 * 
 * @constant {Object}
 * @property {string} keyPath - Path to TLS private key file
 * @property {string} certPath - Path to TLS certificate file
 */
const tlsConfig = {
  /**
   * Path to TLS private key file.
   * Default is './certs/server.key'. Configurable via TLS_KEY_PATH.
   * Resolved to absolute path for consistent file access.
   */
  keyPath: path.resolve(process.env.TLS_KEY_PATH || './certs/server.key'),
  
  /**
   * Path to TLS certificate file.
   * Default is './certs/server.crt'. Configurable via TLS_CERT_PATH.
   * Resolved to absolute path for consistent file access.
   */
  certPath: path.resolve(process.env.TLS_CERT_PATH || './certs/server.crt')
};

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Combined security configuration object containing all settings.
 * This is the default export for convenient single-import usage.
 * 
 * @example
 * // Import all security config
 * const securityConfig = require('./config/security');
 * 
 * // Access specific configurations
 * app.use(helmet(securityConfig.helmetConfig));
 * app.use(cors(securityConfig.corsConfig));
 */
const securityConfig = {
  NODE_ENV,
  isDevelopment,
  isProduction,
  PORT,
  HTTPS_PORT,
  helmetConfig,
  corsConfig,
  rateLimitConfig,
  tlsConfig
};

// Default export - the combined security configuration object
module.exports = securityConfig;

// Named exports for selective importing
module.exports.NODE_ENV = NODE_ENV;
module.exports.isDevelopment = isDevelopment;
module.exports.isProduction = isProduction;
module.exports.PORT = PORT;
module.exports.HTTPS_PORT = HTTPS_PORT;
module.exports.helmetConfig = helmetConfig;
module.exports.corsConfig = corsConfig;
module.exports.rateLimitConfig = rateLimitConfig;
module.exports.tlsConfig = tlsConfig;
