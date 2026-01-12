/**
 * Express.js Server
 * 
 * A simple HTTP server built with Express.js framework.
 * 
 * Endpoints:
 * - GET /        : Returns "Hello, World!\n" response
 * - GET /evening : Returns "Good evening" response
 * 
 * Server Configuration:
 * - Hostname: 127.0.0.1
 * - Port: 3000
 * 
 * @module server
 */

const express = require('express');

// Create Express application instance
const app = express();

// Server configuration
const hostname = '127.0.0.1';
const port = 3000;

/**
 * Root endpoint handler
 * Preserves the original "Hello, World!" functionality from the native http module implementation
 * 
 * @route GET /
 * @returns {string} "Hello, World!\n" - Plain text greeting response
 */
app.get('/', (req, res) => {
  res.send('Hello, World!\n');
});

/**
 * Evening greeting endpoint handler
 * New endpoint added as part of Express.js migration
 * 
 * @route GET /evening
 * @returns {string} "Good evening" - Plain text evening greeting response
 */
app.get('/evening', (req, res) => {
  res.send('Good evening');
});

/**
 * Server instance reference for programmatic control
 * @type {http.Server|null}
 */
let server = null;

/**
 * Starts the Express server
 * 
 * @param {Function} [callback] - Optional callback function called when server is ready
 * @returns {http.Server} The server instance
 */
function startServer(callback) {
  server = app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    if (callback) {
      callback(server);
    }
  });
  return server;
}

/**
 * Stops the Express server gracefully
 * 
 * @param {Function} [callback] - Optional callback function called when server is closed
 */
function stopServer(callback) {
  if (server) {
    server.close((err) => {
      server = null;
      if (callback) {
        callback(err);
      }
    });
  } else if (callback) {
    callback();
  }
}

/**
 * Gets the current server instance
 * 
 * @returns {http.Server|null} The server instance or null if not running
 */
function getServer() {
  return server;
}

/**
 * Gets the Express app instance
 * 
 * @returns {express.Application} The Express app instance
 */
function getApp() {
  return app;
}

/**
 * Gets the server configuration
 * 
 * @returns {Object} Server configuration object
 * @returns {string} returns.hostname - The server hostname
 * @returns {number} returns.port - The server port
 */
function getConfig() {
  return { hostname, port };
}

// Start server only when this file is run directly (not when imported for testing)
if (require.main === module) {
  startServer();
}

// Export for testing
module.exports = {
  app,
  startServer,
  stopServer,
  getServer,
  getApp,
  getConfig
};
