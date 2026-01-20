/**
 * Security Configuration Module
 * 
 * Centralized security settings for the Express.js application.
 * All security features can be configured via environment variables.
 * 
 * @module config/security
 */

/**
 * Security configuration object
 * 
 * @type {Object}
 * @property {boolean} isSecurityEnabled - Master toggle for security middleware
 * @property {boolean} isHttpsEnabled - Enable HTTPS server
 * @property {string} sslKeyPath - Path to SSL private key file
 * @property {string} sslCertPath - Path to SSL certificate file
 */
const securityConfig = {
  /**
   * Master toggle for security middleware
   * Set SECURITY_ENABLED=false to disable all security middleware
   * Default: true (security enabled)
   */
  isSecurityEnabled: process.env.SECURITY_ENABLED !== 'false',

  /**
   * Enable HTTPS server
   * Set HTTPS_ENABLED=true to enable HTTPS
   * Default: false (HTTP only)
   */
  isHttpsEnabled: process.env.HTTPS_ENABLED === 'true',

  /**
   * Path to SSL private key file
   * Default: ./certs/key.pem
   */
  sslKeyPath: process.env.SSL_KEY_PATH || './certs/key.pem',

  /**
   * Path to SSL certificate file
   * Default: ./certs/cert.pem
   */
  sslCertPath: process.env.SSL_CERT_PATH || './certs/cert.pem',
};

module.exports = securityConfig;
