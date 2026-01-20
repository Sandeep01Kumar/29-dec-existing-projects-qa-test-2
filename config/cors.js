/**
 * CORS Configuration Module
 * 
 * Cross-Origin Resource Sharing (CORS) policy configuration.
 * Controls which origins can access the API endpoints.
 * 
 * @module config/cors
 */

/**
 * Parse CORS origins from environment variable
 * 
 * @param {string|undefined} originsEnv - Comma-separated origins string
 * @returns {string[]|boolean} Array of allowed origins or false to deny all
 */
function parseOrigins(originsEnv) {
  if (!originsEnv || originsEnv.trim() === '') {
    // No origins specified - deny cross-origin requests (secure default)
    return false;
  }
  
  // Parse comma-separated origins and trim whitespace
  return originsEnv.split(',').map(origin => origin.trim()).filter(Boolean);
}

/**
 * CORS configuration object
 * 
 * @type {Object}
 * @property {string[]|boolean} origin - Allowed origins or false to deny
 * @property {string[]} methods - Allowed HTTP methods
 * @property {boolean} credentials - Whether to include credentials
 * @property {string[]} allowedHeaders - Allowed request headers
 * @property {number} maxAge - Preflight request cache duration in seconds
 */
const corsConfig = {
  /**
   * Allowed origins for cross-origin requests
   * Set CORS_ORIGINS to comma-separated list of allowed origins
   * Example: CORS_ORIGINS=http://localhost:3001,https://example.com
   * Default: false (deny all cross-origin requests)
   */
  origin: parseOrigins(process.env.CORS_ORIGINS),

  /**
   * Allowed HTTP methods for cross-origin requests
   * Default: GET and POST only
   */
  methods: ['GET', 'POST'],

  /**
   * Whether to include credentials in cross-origin requests
   * Default: false (no credentials)
   */
  credentials: false,

  /**
   * Allowed request headers for cross-origin requests
   * Default: Content-Type and Authorization
   */
  allowedHeaders: ['Content-Type', 'Authorization'],

  /**
   * Preflight request cache duration in seconds
   * Default: 86400 (24 hours)
   */
  maxAge: 86400,
};

module.exports = corsConfig;
