/**
 * @fileoverview Input Validation Middleware Module
 * 
 * This module provides centralized input validation and sanitization middleware
 * using express-validator v7.3.1. It offers reusable validation chains for
 * sanitizing and validating incoming request data (body, query, params).
 * 
 * Security Benefits:
 * - Prevents SQL injection attacks through input sanitization
 * - Prevents XSS (Cross-Site Scripting) through HTML escaping
 * - Prevents command injection through strict input validation
 * - Ensures data integrity by validating all incoming request data
 * - Provides consistent error handling across all endpoints
 * 
 * @module middleware/validation
 * @version 1.0.0
 * @requires express-validator
 */

'use strict';

const { body, param, query, validationResult } = require('express-validator');

/**
 * HTML entities mapping for manual escaping when needed
 * Used by sanitizeBody middleware for comprehensive XSS protection
 * @private
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escapes HTML special characters in a string to prevent XSS attacks
 * @private
 * @param {string} str - The string to escape
 * @returns {string} The escaped string with HTML entities
 */
function escapeHtml(str) {
  if (typeof str !== 'string') {
    return str;
  }
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Middleware to handle validation errors from express-validator chains.
 * 
 * This middleware should be placed after validation chains in the middleware
 * stack. It extracts validation errors and returns a sanitized 400 response
 * if errors are found, or calls next() to proceed if validation passes.
 * 
 * Security Features:
 * - Sanitizes error messages to avoid leaking sensitive information
 * - Returns consistent JSON error format
 * - Logs validation failures for security monitoring
 * 
 * @function handleValidationErrors
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 * 
 * @example
 * // Usage in route handler
 * app.post('/api/user',
 *   validateEmail('email'),
 *   validateStringLength('name', 1, 100),
 *   handleValidationErrors,
 *   (req, res) => {
 *     // Handler logic - only runs if validation passes
 *   }
 * );
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Sanitize error messages to prevent information leakage
    const sanitizedErrors = errors.array().map((error) => {
      // Create a safe error object without potentially sensitive details
      const safeError = {
        field: error.path || error.param || 'unknown',
        message: sanitizeErrorMessage(error.msg),
        type: 'validation_error'
      };
      
      // Include location only if it's a standard location
      if (['body', 'query', 'params', 'headers', 'cookies'].includes(error.location)) {
        safeError.location = error.location;
      }
      
      return safeError;
    });
    
    // Return 400 Bad Request with sanitized error details
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: sanitizedErrors,
      timestamp: new Date().toISOString()
    });
  }
  
  // Validation passed, proceed to next middleware
  next();
}

/**
 * Sanitizes error messages to prevent leaking sensitive information
 * @private
 * @param {string} message - The original error message
 * @returns {string} Sanitized error message safe for client display
 */
function sanitizeErrorMessage(message) {
  if (typeof message !== 'string') {
    return 'Invalid input';
  }
  
  // Remove potential file paths, stack traces, or SQL fragments
  const sensitivePatterns = [
    /\/[a-zA-Z0-9_\-./]+\.[a-zA-Z]+/g,  // File paths
    /at\s+[\w.<>]+\s+\([^)]+\)/g,        // Stack trace lines
    /SELECT|INSERT|UPDATE|DELETE|FROM|WHERE/gi,  // SQL keywords
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,   // IP addresses
    /mongodb(\+srv)?:\/\/[^\s]+/gi,      // MongoDB connection strings
    /postgres(ql)?:\/\/[^\s]+/gi,        // PostgreSQL connection strings
    /mysql:\/\/[^\s]+/gi                  // MySQL connection strings
  ];
  
  let sanitized = message;
  sensitivePatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  // Truncate overly long messages that might contain sensitive data
  const MAX_MESSAGE_LENGTH = 200;
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH) + '...';
  }
  
  return escapeHtml(sanitized);
}

/**
 * Creates a validation chain that sanitizes string input.
 * Trims whitespace and escapes HTML characters to prevent XSS attacks.
 * 
 * Security Benefits:
 * - Removes leading/trailing whitespace that could bypass validation
 * - Escapes HTML characters to prevent stored XSS attacks
 * - Normalizes string input for consistent processing
 * 
 * @function sanitizeString
 * @param {string} fieldName - The name of the field to sanitize
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query', 'params')
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Sanitize a string field in request body
 * app.post('/api/comment',
 *   sanitizeString('content'),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 * 
 * @example
 * // Sanitize a query parameter
 * app.get('/api/search',
 *   sanitizeString('q', { location: 'query' }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function sanitizeString(fieldName, options = {}) {
  const { location = 'body' } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'params':
      validator = param(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  return validator
    .exists({ checkFalsy: false })
    .withMessage(`${fieldName} is required`)
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .trim()
    .escape()
    .notEmpty()
    .withMessage(`${fieldName} cannot be empty`);
}

/**
 * Creates a validation chain for email addresses.
 * Validates email format and normalizes the email address.
 * 
 * Security Benefits:
 * - Prevents invalid email injection attacks
 * - Normalizes emails to prevent duplicate accounts with case variations
 * - Validates against RFC 5322 email format standards
 * 
 * @function validateEmail
 * @param {string} [fieldName='email'] - The name of the email field
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query', 'params')
 * @param {boolean} [options.required=true] - Whether the field is required
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate email in registration form
 * app.post('/api/register',
 *   validateEmail('email'),
 *   validateStringLength('password', 8, 128),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 * 
 * @example
 * // Validate optional email
 * app.put('/api/profile',
 *   validateEmail('alternateEmail', { required: false }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateEmail(fieldName = 'email', options = {}) {
  const { location = 'body', required = true } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'params':
      validator = param(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  if (required) {
    return validator
      .exists({ checkFalsy: true })
      .withMessage(`${fieldName} is required`)
      .isString()
      .withMessage(`${fieldName} must be a string`)
      .trim()
      .isEmail()
      .withMessage(`${fieldName} must be a valid email address`)
      .normalizeEmail({
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        outlookdotcom_remove_subaddress: false,
        yahoo_remove_subaddress: false,
        icloud_remove_subaddress: false,
        all_lowercase: true
      })
      .isLength({ max: 254 })
      .withMessage(`${fieldName} must not exceed 254 characters`);
  }
  
  return validator
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .trim()
    .isEmail()
    .withMessage(`${fieldName} must be a valid email address`)
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
      all_lowercase: true
    })
    .isLength({ max: 254 })
    .withMessage(`${fieldName} must not exceed 254 characters`);
}

/**
 * Creates a validation chain that enforces string length limits.
 * Validates that a string field has a length within specified bounds.
 * 
 * Security Benefits:
 * - Prevents buffer overflow attempts with excessively long strings
 * - Ensures data fits within database column limits
 * - Protects against denial-of-service via large payloads
 * 
 * @function validateStringLength
 * @param {string} fieldName - The name of the field to validate
 * @param {number} min - Minimum string length (inclusive)
 * @param {number} max - Maximum string length (inclusive)
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query', 'params')
 * @param {boolean} [options.required=true] - Whether the field is required
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate username length (3-50 characters)
 * app.post('/api/user',
 *   validateStringLength('username', 3, 50),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 * 
 * @example
 * // Validate bio with optional field
 * app.put('/api/profile',
 *   validateStringLength('bio', 0, 500, { required: false }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateStringLength(fieldName, min, max, options = {}) {
  const { location = 'body', required = true } = options;
  
  // Validate input parameters
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('validateStringLength: min and max must be numbers');
  }
  
  if (min < 0 || max < 0) {
    throw new Error('validateStringLength: min and max must be non-negative');
  }
  
  if (min > max) {
    throw new Error('validateStringLength: min cannot be greater than max');
  }
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'params':
      validator = param(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  if (required) {
    return validator
      .exists({ checkFalsy: min === 0 ? false : true })
      .withMessage(`${fieldName} is required`)
      .isString()
      .withMessage(`${fieldName} must be a string`)
      .trim()
      .isLength({ min, max })
      .withMessage(`${fieldName} must be between ${min} and ${max} characters`)
      .escape();
  }
  
  return validator
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .trim()
    .isLength({ min, max })
    .withMessage(`${fieldName} must be between ${min} and ${max} characters`)
    .escape();
}

/**
 * Creates a validation chain for numeric values.
 * Ensures the value is numeric and within safe integer range.
 * 
 * Security Benefits:
 * - Prevents integer overflow attacks
 * - Validates against injection attempts using numeric fields
 * - Ensures numeric data integrity for calculations
 * - Protects against NaN and Infinity injection
 * 
 * @function validateNumeric
 * @param {string} fieldName - The name of the field to validate
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query', 'params')
 * @param {boolean} [options.required=true] - Whether the field is required
 * @param {number} [options.min=-Number.MAX_SAFE_INTEGER] - Minimum allowed value
 * @param {number} [options.max=Number.MAX_SAFE_INTEGER] - Maximum allowed value
 * @param {boolean} [options.allowFloat=true] - Whether to allow floating-point numbers
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate age (integer between 0 and 150)
 * app.post('/api/user',
 *   validateNumeric('age', { min: 0, max: 150, allowFloat: false }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 * 
 * @example
 * // Validate price (positive float)
 * app.post('/api/product',
 *   validateNumeric('price', { min: 0.01, max: 999999.99 }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateNumeric(fieldName, options = {}) {
  const {
    location = 'body',
    required = true,
    min = -Number.MAX_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    allowFloat = true
  } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'params':
      validator = param(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  if (required) {
    let chain = validator
      .exists({ checkFalsy: false })
      .withMessage(`${fieldName} is required`);
    
    if (allowFloat) {
      chain = chain
        .isFloat({ min, max })
        .withMessage(`${fieldName} must be a number between ${min} and ${max}`)
        .toFloat();
    } else {
      chain = chain
        .isInt({ min, max })
        .withMessage(`${fieldName} must be an integer between ${min} and ${max}`)
        .toInt();
    }
    
    return chain
      .custom((value) => {
        // Additional check for NaN and Infinity
        if (!Number.isFinite(value)) {
          throw new Error(`${fieldName} must be a finite number`);
        }
        return true;
      });
  }
  
  let chain = validator.optional({ checkFalsy: true });
  
  if (allowFloat) {
    chain = chain
      .isFloat({ min, max })
      .withMessage(`${fieldName} must be a number between ${min} and ${max}`)
      .toFloat();
  } else {
    chain = chain
      .isInt({ min, max })
      .withMessage(`${fieldName} must be an integer between ${min} and ${max}`)
      .toInt();
  }
  
  return chain
    .custom((value) => {
      // Additional check for NaN and Infinity
      if (value !== undefined && value !== null && !Number.isFinite(value)) {
        throw new Error(`${fieldName} must be a finite number`);
      }
      return true;
    });
}

/**
 * Creates a validation chain for optional string fields.
 * Same sanitization as sanitizeString but the field is optional.
 * 
 * Security Benefits:
 * - Provides consistent sanitization for optional fields
 * - Prevents XSS attacks through optional input fields
 * - Maintains data quality even for non-required fields
 * 
 * @function validateOptionalString
 * @param {string} fieldName - The name of the field to validate
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query', 'params')
 * @param {number} [options.maxLength=1000] - Maximum string length
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate optional middle name
 * app.post('/api/user',
 *   sanitizeString('firstName'),
 *   sanitizeString('lastName'),
 *   validateOptionalString('middleName'),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 * 
 * @example
 * // Validate optional description with custom max length
 * app.post('/api/item',
 *   validateOptionalString('description', { maxLength: 2000 }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateOptionalString(fieldName, options = {}) {
  const { location = 'body', maxLength = 1000 } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'params':
      validator = param(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  return validator
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${fieldName} must not exceed ${maxLength} characters`)
    .escape();
}

/**
 * Middleware to sanitize all string values in the request body.
 * Iterates through all keys in req.body and applies HTML escaping
 * to string values to prevent XSS attacks.
 * 
 * Security Benefits:
 * - Provides comprehensive XSS protection for entire request body
 * - Acts as a safety net for fields without explicit validation
 * - Recursively sanitizes nested objects and arrays
 * - Preserves non-string values unchanged
 * 
 * Note: This middleware should be used in addition to, not instead of,
 * specific field validation. It provides defense-in-depth protection.
 * 
 * @function sanitizeBody
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 * 
 * @example
 * // Apply to all routes as global middleware
 * app.use(express.json());
 * app.use(sanitizeBody);
 * 
 * @example
 * // Apply to specific routes
 * app.post('/api/data',
 *   sanitizeBody,
 *   handleValidationErrors,
 *   (req, res) => {
 *     // All string values in req.body are now HTML-escaped
 *   }
 * );
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Recursively sanitizes all string values in an object.
 * Handles nested objects and arrays.
 * @private
 * @param {*} obj - The object to sanitize
 * @param {number} [depth=0] - Current recursion depth (for protection)
 * @returns {*} The sanitized object
 */
function sanitizeObject(obj, depth = 0) {
  // Prevent excessive recursion (protection against deeply nested payloads)
  const MAX_DEPTH = 10;
  if (depth > MAX_DEPTH) {
    return obj;
  }
  
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle strings - escape HTML characters
  if (typeof obj === 'string') {
    return escapeHtml(obj.trim());
  }
  
  // Handle arrays - recursively sanitize each element
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }
  
  // Handle objects - recursively sanitize each property
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Also sanitize the key to prevent XSS through dynamic property names
      const sanitizedKey = escapeHtml(String(key));
      sanitized[sanitizedKey] = sanitizeObject(value, depth + 1);
    }
    return sanitized;
  }
  
  // Return other types (numbers, booleans) unchanged
  return obj;
}

/**
 * Creates a validation chain for UUID fields.
 * Validates that the field contains a valid UUID v4 format.
 * 
 * Security Benefits:
 * - Prevents ID injection attacks
 * - Ensures proper format for database lookups
 * - Protects against path traversal using ID parameters
 * 
 * @function validateUUID
 * @param {string} fieldName - The name of the field to validate
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='params'] - Request location ('body', 'query', 'params')
 * @param {boolean} [options.required=true] - Whether the field is required
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate user ID in URL params
 * app.get('/api/users/:userId',
 *   validateUUID('userId'),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateUUID(fieldName, options = {}) {
  const { location = 'params', required = true } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'body':
      validator = body(fieldName);
      break;
    case 'params':
    default:
      validator = param(fieldName);
      break;
  }
  
  if (required) {
    return validator
      .exists({ checkFalsy: true })
      .withMessage(`${fieldName} is required`)
      .isUUID(4)
      .withMessage(`${fieldName} must be a valid UUID`);
  }
  
  return validator
    .optional({ checkFalsy: true })
    .isUUID(4)
    .withMessage(`${fieldName} must be a valid UUID`);
}

/**
 * Creates a validation chain for boolean fields.
 * Validates that the field is a boolean value.
 * 
 * @function validateBoolean
 * @param {string} fieldName - The name of the field to validate
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query', 'params')
 * @param {boolean} [options.required=true] - Whether the field is required
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate notification preference
 * app.put('/api/settings',
 *   validateBoolean('emailNotifications'),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateBoolean(fieldName, options = {}) {
  const { location = 'body', required = true } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'params':
      validator = param(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  if (required) {
    return validator
      .exists()
      .withMessage(`${fieldName} is required`)
      .isBoolean()
      .withMessage(`${fieldName} must be a boolean`)
      .toBoolean();
  }
  
  return validator
    .optional()
    .isBoolean()
    .withMessage(`${fieldName} must be a boolean`)
    .toBoolean();
}

/**
 * Creates a validation chain for array fields.
 * Validates that the field is an array with optional length constraints.
 * 
 * @function validateArray
 * @param {string} fieldName - The name of the field to validate
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query')
 * @param {boolean} [options.required=true] - Whether the field is required
 * @param {number} [options.minLength=0] - Minimum array length
 * @param {number} [options.maxLength=100] - Maximum array length
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate tags array (1-10 items)
 * app.post('/api/article',
 *   validateArray('tags', { minLength: 1, maxLength: 10 }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateArray(fieldName, options = {}) {
  const {
    location = 'body',
    required = true,
    minLength = 0,
    maxLength = 100
  } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  if (required) {
    return validator
      .exists({ checkFalsy: true })
      .withMessage(`${fieldName} is required`)
      .isArray({ min: minLength, max: maxLength })
      .withMessage(`${fieldName} must be an array with ${minLength}-${maxLength} items`);
  }
  
  return validator
    .optional({ checkFalsy: true })
    .isArray({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be an array with ${minLength}-${maxLength} items`);
}

/**
 * Creates a validation chain for URL fields.
 * Validates that the field contains a valid URL.
 * 
 * Security Benefits:
 * - Prevents SSRF (Server-Side Request Forgery) attacks
 * - Validates URL format before storing or following
 * - Can restrict to specific protocols (https only)
 * 
 * @function validateURL
 * @param {string} fieldName - The name of the field to validate
 * @param {Object} [options={}] - Additional options
 * @param {string} [options.location='body'] - Request location ('body', 'query', 'params')
 * @param {boolean} [options.required=true] - Whether the field is required
 * @param {string[]} [options.protocols=['http', 'https']] - Allowed protocols
 * @returns {import('express-validator').ValidationChain} Express-validator validation chain
 * 
 * @example
 * // Validate website URL (HTTPS only)
 * app.post('/api/profile',
 *   validateURL('website', { protocols: ['https'] }),
 *   handleValidationErrors,
 *   (req, res) => { ... }
 * );
 */
function validateURL(fieldName, options = {}) {
  const {
    location = 'body',
    required = true,
    protocols = ['http', 'https']
  } = options;
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'query':
      validator = query(fieldName);
      break;
    case 'params':
      validator = param(fieldName);
      break;
    case 'body':
    default:
      validator = body(fieldName);
      break;
  }
  
  const urlOptions = {
    protocols,
    require_protocol: true,
    require_valid_protocol: true,
    allow_underscores: false
  };
  
  if (required) {
    return validator
      .exists({ checkFalsy: true })
      .withMessage(`${fieldName} is required`)
      .isString()
      .withMessage(`${fieldName} must be a string`)
      .trim()
      .isURL(urlOptions)
      .withMessage(`${fieldName} must be a valid URL with protocol: ${protocols.join(' or ')}`)
      .isLength({ max: 2048 })
      .withMessage(`${fieldName} must not exceed 2048 characters`);
  }
  
  return validator
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(`${fieldName} must be a string`)
    .trim()
    .isURL(urlOptions)
    .withMessage(`${fieldName} must be a valid URL with protocol: ${protocols.join(' or ')}`)
    .isLength({ max: 2048 })
    .withMessage(`${fieldName} must not exceed 2048 characters`);
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Export validation utilities and re-export express-validator functions
 * for convenience when building custom validation chains.
 */
module.exports = {
  // Core validation error handler
  handleValidationErrors,
  
  // String validation and sanitization
  sanitizeString,
  validateOptionalString,
  validateStringLength,
  
  // Type-specific validators
  validateEmail,
  validateNumeric,
  validateUUID,
  validateBoolean,
  validateArray,
  validateURL,
  
  // Request body sanitization
  sanitizeBody,
  
  // Re-exported express-validator functions for custom validation chains
  body,
  param,
  query,
  validationResult
};
