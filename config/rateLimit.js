/**
 * Rate Limiting Configuration Module
 * 
 * Controls request rate limiting to protect against DoS attacks
 * and brute-force attempts.
 * 
 * @module config/rateLimit
 */

/**
 * Rate limiting configuration object
 * 
 * @type {Object}
 * @property {number} windowMs - Time window in milliseconds
 * @property {number} limit - Maximum requests per window per IP
 * @property {string} standardHeaders - Rate limit header standard to use
 * @property {boolean} legacyHeaders - Whether to send legacy X-RateLimit headers
 * @property {string} message - Response message when limit exceeded
 * @property {number} statusCode - HTTP status code when limit exceeded
 * @property {boolean} skipSuccessfulRequests - Whether to skip counting successful requests
 * @property {boolean} skipFailedRequests - Whether to skip counting failed requests
 */
const rateLimitConfig = {
  /**
   * Time window in milliseconds
   * Set RATE_WINDOW_MS to customize
   * Default: 900000 (15 minutes)
   */
  windowMs: parseInt(process.env.RATE_WINDOW_MS, 10) || 900000,

  /**
   * Maximum number of requests per window per IP
   * Set RATE_LIMIT to customize
   * Default: 100 requests per window
   */
  limit: parseInt(process.env.RATE_LIMIT, 10) || 100,

  /**
   * Rate limit header standard to use
   * Options: 'draft-6', 'draft-7', 'draft-8'
   * Default: 'draft-8' (combined RateLimit header)
   */
  standardHeaders: 'draft-8',

  /**
   * Whether to send legacy X-RateLimit-* headers
   * Default: false (modern headers only)
   */
  legacyHeaders: false,

  /**
   * Response message when rate limit is exceeded
   */
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },

  /**
   * HTTP status code when rate limit is exceeded
   * Default: 429 (Too Many Requests)
   */
  statusCode: 429,

  /**
   * Whether to skip counting successful requests
   * Default: false (count all requests)
   */
  skipSuccessfulRequests: false,

  /**
   * Whether to skip counting failed requests
   * Default: false (count all requests)
   */
  skipFailedRequests: false,
};

module.exports = rateLimitConfig;
