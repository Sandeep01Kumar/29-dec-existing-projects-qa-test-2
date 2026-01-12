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

// Start the Express server
// Using the same hostname and port configuration for backward compatibility
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
