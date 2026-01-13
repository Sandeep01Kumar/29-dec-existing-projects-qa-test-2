/**
 * @fileoverview Helmet.js Security Middleware Configuration Module
 * 
 * This module provides pre-configured security middleware for Express.js applications
 * using Helmet.js v8.1.0 to set 15+ HTTP security headers. It serves as the primary
 * defense layer against common web attacks including:
 * 
 * - Cross-Site Scripting (XSS): Mitigated via Content-Security-Policy
 * - Clickjacking: Prevented by X-Frame-Options and frame-ancestors CSP
 * - MIME-type sniffing: Blocked by X-Content-Type-Options: nosniff
 * - Protocol downgrade attacks: Prevented by Strict-Transport-Security (HSTS)
 * - Information leakage: Controlled via Referrer-Policy and X-Powered-By removal
 * - Cross-origin attacks: Managed by CORP, COEP, and COOP headers
 * 
 * Security headers follow OWASP recommendations for web application security.
 * Configuration is environment-aware via imports from the central security config.
 * 
 * @module src/middleware/security
 * @requires helmet
 * @requires ../config/security
 * @see https://helmetjs.github.io/ - Helmet.js Documentation
 * @see https://owasp.org/www-project-secure-headers/ - OWASP Secure Headers Project
 */

'use strict';

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================

/**
 * Helmet.js v8.1.0 - Security middleware that sets HTTP response headers.
 * Helmet automatically sets the following headers by default:
 * - Content-Security-Policy
 * - Cross-Origin-Opener-Policy
 * - Cross-Origin-Resource-Policy
 * - Origin-Agent-Cluster
 * - Referrer-Policy
 * - Strict-Transport-Security
 * - X-Content-Type-Options
 * - X-DNS-Prefetch-Control
 * - X-Download-Options
 * - X-Frame-Options
 * - X-Permitted-Cross-Domain-Policies
 * - X-XSS-Protection (removed in v8.x as it's considered harmful)
 * 
 * @external helmet
 * @see https://www.npmjs.com/package/helmet
 */
const helmet = require('helmet');

// =============================================================================
// INTERNAL DEPENDENCIES
// =============================================================================

/**
 * Import security configuration from the centralized config module.
 * This ensures consistent security settings across all middleware.
 * 
 * @type {Object}
 * @property {Object} helmetConfig - Helmet configuration (CSP, HSTS, referrerPolicy)
 * @property {Object} helmetConfig.contentSecurityPolicy - CSP directives
 * @property {Object} helmetConfig.hsts - HSTS settings (maxAge, includeSubDomains, preload)
 * @property {Object} helmetConfig.referrerPolicy - Referrer policy configuration
 * @property {boolean} isDevelopment - True if running in development mode
 * @property {boolean} isProduction - True if running in production mode
 */
const { 
  helmetConfig,
  isDevelopment,
  isProduction 
} = require('../config/security');

// =============================================================================
// SECURITY HEADERS DOCUMENTATION
// =============================================================================

/**
 * Complete list of security headers configured by this module.
 * Each header serves a specific security purpose as documented below.
 * 
 * @constant {Object[]}
 */
const SECURITY_HEADERS_DOCUMENTATION = [
  {
    name: 'Content-Security-Policy',
    purpose: 'Mitigates Cross-Site Scripting (XSS) and data injection attacks by restricting resource loading sources',
    owasp: 'Required header - prevents unauthorized script execution',
    defaultValue: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
  },
  {
    name: 'Strict-Transport-Security',
    purpose: 'Forces browsers to use HTTPS for all future connections to the domain',
    owasp: 'Required header - prevents protocol downgrade attacks and cookie hijacking',
    defaultValue: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    name: 'X-Content-Type-Options',
    purpose: 'Prevents browsers from MIME-sniffing responses, reducing drive-by download attacks',
    owasp: 'Required header - ensures browsers respect declared Content-Type',
    defaultValue: 'nosniff'
  },
  {
    name: 'X-Frame-Options',
    purpose: 'Prevents clickjacking by controlling whether the page can be embedded in frames',
    owasp: 'Required header - protects against UI redressing attacks',
    defaultValue: 'SAMEORIGIN'
  },
  {
    name: 'X-DNS-Prefetch-Control',
    purpose: 'Controls browser DNS prefetching to prevent information leakage',
    owasp: 'Recommended header - reduces privacy risks from DNS queries',
    defaultValue: 'off'
  },
  {
    name: 'Referrer-Policy',
    purpose: 'Controls how much referrer information is sent with requests',
    owasp: 'Recommended header - prevents leakage of sensitive URLs',
    defaultValue: 'strict-origin-when-cross-origin'
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    purpose: 'Isolates browsing context to prevent cross-origin attacks like Spectre',
    owasp: 'Recommended for high-security applications',
    defaultValue: 'same-origin'
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    purpose: 'Prevents other origins from loading your resources',
    owasp: 'Recommended header - protects against cross-origin data leaks',
    defaultValue: 'same-origin'
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    purpose: 'Prevents loading cross-origin resources that do not explicitly grant permission',
    owasp: 'Required for SharedArrayBuffer and high-resolution timers',
    defaultValue: 'require-corp'
  },
  {
    name: 'Origin-Agent-Cluster',
    purpose: 'Hints that the document should be placed in its own origin-keyed agent cluster',
    owasp: 'Performance and security isolation benefit',
    defaultValue: '?1'
  },
  {
    name: 'X-Permitted-Cross-Domain-Policies',
    purpose: 'Restricts Adobe Flash and PDF cross-domain data loading',
    owasp: 'Legacy protection - still relevant for some enterprise environments',
    defaultValue: 'none'
  },
  {
    name: 'X-Download-Options',
    purpose: 'Prevents Internet Explorer from executing downloads in site context',
    owasp: 'IE-specific protection against drive-by downloads',
    defaultValue: 'noopen'
  }
];

// =============================================================================
// CORE MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * Configures and returns the Helmet.js middleware with full security header configuration.
 * 
 * This function creates a properly configured Helmet middleware instance based on the
 * centralized security configuration and the current environment. In development mode,
 * some policies may be slightly relaxed to facilitate debugging while maintaining
 * core security protections.
 * 
 * @function configureHelmet
 * @param {Object} [options={}] - Optional override configuration
 * @param {Object} [options.contentSecurityPolicy] - Override CSP directives
 * @param {Object} [options.hsts] - Override HSTS settings
 * @param {Object} [options.referrerPolicy] - Override referrer policy
 * @param {boolean} [options.crossOriginEmbedderPolicy] - Enable/disable COEP
 * @returns {Function} Configured Helmet middleware function for Express.js
 * 
 * @example
 * // Basic usage with default configuration
 * const { configureHelmet } = require('./middleware/security');
 * app.use(configureHelmet());
 * 
 * @example
 * // With custom CSP overrides
 * app.use(configureHelmet({
 *   contentSecurityPolicy: {
 *     directives: {
 *       scriptSrc: ["'self'", "trusted-cdn.com"]
 *     }
 *   }
 * }));
 */
function configureHelmet(options = {}) {
  // Build the complete Helmet configuration by merging base config with options
  const config = {
    /**
     * Content-Security-Policy configuration.
     * Uses directives from central config, allows overrides via options.
     * CSP is the primary defense against XSS attacks.
     */
    contentSecurityPolicy: options.contentSecurityPolicy !== undefined
      ? options.contentSecurityPolicy
      : helmetConfig.contentSecurityPolicy,

    /**
     * Strict-Transport-Security configuration.
     * Configures HSTS with 1-year max-age, includeSubDomains, and preload.
     * Essential for ensuring HTTPS-only communication.
     */
    hsts: options.hsts !== undefined
      ? options.hsts
      : helmetConfig.hsts,

    /**
     * Referrer-Policy configuration.
     * Controls referrer information sent with requests.
     * Default: strict-origin-when-cross-origin (balanced privacy/functionality).
     */
    referrerPolicy: options.referrerPolicy !== undefined
      ? options.referrerPolicy
      : helmetConfig.referrerPolicy,

    /**
     * Cross-Origin-Embedder-Policy configuration.
     * In development, COEP can interfere with loading external resources during testing.
     * In production, enables full cross-origin isolation for enhanced security.
     */
    crossOriginEmbedderPolicy: options.crossOriginEmbedderPolicy !== undefined
      ? options.crossOriginEmbedderPolicy
      : (isProduction ? { policy: 'require-corp' } : false),

    /**
     * Cross-Origin-Opener-Policy configuration.
     * Isolates the browsing context from cross-origin windows.
     * Prevents Spectre-style side-channel attacks.
     */
    crossOriginOpenerPolicy: options.crossOriginOpenerPolicy !== undefined
      ? options.crossOriginOpenerPolicy
      : { policy: 'same-origin' },

    /**
     * Cross-Origin-Resource-Policy configuration.
     * Prevents other origins from loading resources from this server.
     * Essential for preventing data exfiltration.
     */
    crossOriginResourcePolicy: options.crossOriginResourcePolicy !== undefined
      ? options.crossOriginResourcePolicy
      : { policy: 'same-origin' },

    /**
     * X-DNS-Prefetch-Control configuration.
     * Disables DNS prefetching to prevent information leakage.
     */
    dnsPrefetchControl: options.dnsPrefetchControl !== undefined
      ? options.dnsPrefetchControl
      : { allow: false },

    /**
     * X-Frame-Options configuration.
     * Prevents clickjacking by controlling frame embedding.
     * SAMEORIGIN allows same-origin frames only.
     */
    frameguard: options.frameguard !== undefined
      ? options.frameguard
      : { action: 'sameorigin' },

    /**
     * X-Permitted-Cross-Domain-Policies configuration.
     * Restricts Adobe Flash and PDF cross-domain policies.
     */
    permittedCrossDomainPolicies: options.permittedCrossDomainPolicies !== undefined
      ? options.permittedCrossDomainPolicies
      : { permittedPolicies: 'none' },

    /**
     * Hide X-Powered-By header.
     * Helmet removes this by default, but explicitly setting ensures it.
     * Prevents information disclosure about the server technology.
     */
    hidePoweredBy: true,

    /**
     * X-Download-Options configuration.
     * Prevents IE from opening downloads directly in the browser.
     */
    ieNoOpen: true,

    /**
     * X-Content-Type-Options configuration.
     * Prevents MIME-type sniffing attacks.
     */
    noSniff: true,

    /**
     * Origin-Agent-Cluster configuration.
     * Enables origin-keyed agent clustering for isolation.
     */
    originAgentCluster: true
  };

  // Return configured Helmet middleware
  return helmet(config);
}

/**
 * Returns a comprehensive list of all security headers set by the configured Helmet middleware.
 * 
 * This function provides documentation and debugging information about the security
 * headers that will be applied to responses. Useful for:
 * - Security audits and compliance checks
 * - Debugging header-related issues
 * - Documentation generation
 * - Verifying security configuration
 * 
 * @function getSecurityHeaders
 * @returns {Object[]} Array of security header objects with name, purpose, and default values
 * 
 * @example
 * const { getSecurityHeaders } = require('./middleware/security');
 * const headers = getSecurityHeaders();
 * console.log('Security headers configured:', headers.map(h => h.name).join(', '));
 * 
 * @example
 * // Use in an admin endpoint to expose security configuration
 * app.get('/admin/security-headers', (req, res) => {
 *   res.json({ headers: getSecurityHeaders() });
 * });
 */
function getSecurityHeaders() {
  // Return a deep copy of the headers documentation to prevent modification
  return SECURITY_HEADERS_DOCUMENTATION.map(header => ({
    name: header.name,
    purpose: header.purpose,
    owasp: header.owasp,
    defaultValue: header.defaultValue
  }));
}

/**
 * Creates and returns an array of security-related Express middleware in the correct order.
 * 
 * This factory function assembles all security middleware that should be applied
 * to Express routes. The middleware is returned in the recommended application order:
 * 1. Helmet (security headers) - Applied first for immediate header protection
 * 2. Custom security headers (if any) - Additional headers not covered by Helmet
 * 
 * Note: X-Powered-By removal is handled automatically by Helmet when hidePoweredBy is true.
 * 
 * @function securityMiddleware
 * @param {Object} [options={}] - Configuration options for middleware stack
 * @param {Object} [options.helmetOptions] - Override options for Helmet configuration
 * @param {Object} [options.additionalHeaders] - Custom headers to add to responses
 * @returns {Function[]} Array of Express middleware functions in application order
 * 
 * @example
 * // Apply all security middleware with defaults
 * const { securityMiddleware } = require('./middleware/security');
 * app.use(securityMiddleware());
 * 
 * @example
 * // Apply with custom configuration
 * app.use(securityMiddleware({
 *   helmetOptions: {
 *     contentSecurityPolicy: false // Disable CSP for testing
 *   },
 *   additionalHeaders: {
 *     'X-Custom-Security': 'enabled'
 *   }
 * }));
 * 
 * @example
 * // Apply middleware individually for more control
 * const middlewareStack = securityMiddleware();
 * middlewareStack.forEach(middleware => app.use(middleware));
 */
function securityMiddleware(options = {}) {
  const { helmetOptions = {}, additionalHeaders = {} } = options;
  
  // Array to hold all security middleware in correct order
  const middleware = [];

  // 1. Add configured Helmet middleware as the primary security layer
  // Helmet sets 15+ security headers including CSP, HSTS, X-Frame-Options, etc.
  middleware.push(configureHelmet(helmetOptions));

  // 2. Add custom security headers middleware if any additional headers are specified
  // This allows extending security beyond what Helmet provides
  if (Object.keys(additionalHeaders).length > 0) {
    middleware.push(createCustomHeadersMiddleware(additionalHeaders));
  }

  // 3. Add development-mode security logging middleware
  // Helps debug security header issues during development
  if (isDevelopment) {
    middleware.push(createSecurityLoggingMiddleware());
  }

  return middleware;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Creates middleware that adds custom security headers to responses.
 * 
 * This is useful for adding security headers not covered by Helmet or for
 * implementing organization-specific security policies.
 * 
 * @private
 * @param {Object} headers - Object mapping header names to values
 * @returns {Function} Express middleware function
 */
function createCustomHeadersMiddleware(headers) {
  return function customSecurityHeaders(req, res, next) {
    // Set each custom header on the response
    Object.entries(headers).forEach(([headerName, headerValue]) => {
      // Only set header if value is truthy
      if (headerValue !== null && headerValue !== undefined && headerValue !== '') {
        res.setHeader(headerName, String(headerValue));
      }
    });
    next();
  };
}

/**
 * Creates development-only middleware that logs security header application.
 * 
 * This middleware helps developers verify that security headers are being
 * applied correctly during development and testing phases.
 * 
 * @private
 * @returns {Function} Express middleware function
 */
function createSecurityLoggingMiddleware() {
  return function securityLogging(req, res, next) {
    // Store original end function
    const originalEnd = res.end;
    
    // Override end to log security headers
    res.end = function(...args) {
      // Only log for non-static resources to reduce noise
      if (!req.path.match(/\.(js|css|png|jpg|ico|map)$/)) {
        const securityHeaders = {};
        
        // Extract security-related headers from response
        const headerNames = [
          'content-security-policy',
          'strict-transport-security',
          'x-content-type-options',
          'x-frame-options',
          'x-dns-prefetch-control',
          'referrer-policy',
          'cross-origin-opener-policy',
          'cross-origin-resource-policy',
          'cross-origin-embedder-policy',
          'origin-agent-cluster'
        ];

        headerNames.forEach(name => {
          const value = res.getHeader(name);
          if (value) {
            securityHeaders[name] = value;
          }
        });

        // Log the security headers applied to this request
        if (Object.keys(securityHeaders).length > 0) {
          console.log(`[Security] ${req.method} ${req.path} - Headers applied:`, 
            Object.keys(securityHeaders).length);
        }
      }
      
      // Call original end function
      return originalEnd.apply(res, args);
    };
    
    next();
  };
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export the security middleware module.
 * 
 * Provides four main exports:
 * 1. configureHelmet - Function to create configured Helmet middleware
 * 2. getSecurityHeaders - Function to retrieve list of security headers
 * 3. securityMiddleware - Factory function for complete security middleware stack
 * 4. helmet - Re-export of Helmet for direct use when custom configuration is needed
 * 
 * @example
 * // Import specific functions
 * const { configureHelmet, securityMiddleware } = require('./middleware/security');
 * 
 * @example
 * // Import helmet directly for advanced use cases
 * const { helmet } = require('./middleware/security');
 * app.use(helmet({ contentSecurityPolicy: false }));
 */
module.exports = {
  /**
   * Creates and returns configured Helmet middleware.
   * @function
   */
  configureHelmet,

  /**
   * Returns array of security header documentation objects.
   * @function
   */
  getSecurityHeaders,

  /**
   * Creates array of security middleware in correct application order.
   * @function
   */
  securityMiddleware,

  /**
   * Re-export of Helmet.js for direct use when advanced customization is needed.
   * Useful when you need Helmet functionality not exposed by this module.
   * @function
   */
  helmet
};
