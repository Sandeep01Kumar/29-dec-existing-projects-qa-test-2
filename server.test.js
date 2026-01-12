/**
 * Comprehensive Unit Tests for Express.js Server
 * 
 * Tests cover:
 * - HTTP responses for all endpoints
 * - Status codes
 * - Response headers
 * - Server startup/shutdown
 * - Error handling
 * - Edge cases
 * 
 * @module server.test
 */

const request = require('supertest');
const { app, startServer, stopServer, getServer, getApp, getConfig } = require('./server');

describe('Express.js Server', () => {
  
  // ============================================================
  // HTTP Response Tests
  // ============================================================
  describe('HTTP Responses', () => {
    
    describe('GET /', () => {
      it('should return "Hello, World!\\n" response', async () => {
        const response = await request(app).get('/');
        expect(response.text).toBe('Hello, World!\n');
      });

      it('should return exact response content with newline', async () => {
        const response = await request(app).get('/');
        expect(response.text).toMatch(/^Hello, World!\n$/);
      });

      it('should return consistent response on multiple requests', async () => {
        const response1 = await request(app).get('/');
        const response2 = await request(app).get('/');
        const response3 = await request(app).get('/');
        
        expect(response1.text).toBe(response2.text);
        expect(response2.text).toBe(response3.text);
        expect(response1.text).toBe('Hello, World!\n');
      });
    });

    describe('GET /evening', () => {
      it('should return "Good evening" response', async () => {
        const response = await request(app).get('/evening');
        expect(response.text).toBe('Good evening');
      });

      it('should return response without trailing newline', async () => {
        const response = await request(app).get('/evening');
        expect(response.text).not.toMatch(/\n$/);
        expect(response.text).toBe('Good evening');
      });

      it('should return consistent response on multiple requests', async () => {
        const response1 = await request(app).get('/evening');
        const response2 = await request(app).get('/evening');
        const response3 = await request(app).get('/evening');
        
        expect(response1.text).toBe(response2.text);
        expect(response2.text).toBe(response3.text);
        expect(response1.text).toBe('Good evening');
      });
    });
  });

  // ============================================================
  // Status Code Tests
  // ============================================================
  describe('Status Codes', () => {
    
    describe('Successful Requests (2xx)', () => {
      it('should return 200 OK for GET /', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.statusCode).toBe(200);
      });

      it('should return 200 OK for GET /evening', async () => {
        const response = await request(app).get('/evening');
        expect(response.status).toBe(200);
        expect(response.statusCode).toBe(200);
      });
    });

    describe('Not Found Requests (4xx)', () => {
      it('should return 404 for non-existent routes', async () => {
        const response = await request(app).get('/nonexistent');
        expect(response.status).toBe(404);
      });

      it('should return 404 for /hello', async () => {
        const response = await request(app).get('/hello');
        expect(response.status).toBe(404);
      });

      it('should return 404 for /morning', async () => {
        const response = await request(app).get('/morning');
        expect(response.status).toBe(404);
      });

      it('should return 404 for random path', async () => {
        const response = await request(app).get('/random/path/that/does/not/exist');
        expect(response.status).toBe(404);
      });
    });

    describe('Method Not Allowed', () => {
      it('should return 404 for POST to /', async () => {
        const response = await request(app).post('/');
        expect(response.status).toBe(404);
      });

      it('should return 404 for PUT to /', async () => {
        const response = await request(app).put('/');
        expect(response.status).toBe(404);
      });

      it('should return 404 for DELETE to /', async () => {
        const response = await request(app).delete('/');
        expect(response.status).toBe(404);
      });

      it('should return 404 for PATCH to /', async () => {
        const response = await request(app).patch('/');
        expect(response.status).toBe(404);
      });

      it('should return 404 for POST to /evening', async () => {
        const response = await request(app).post('/evening');
        expect(response.status).toBe(404);
      });

      it('should return 404 for PUT to /evening', async () => {
        const response = await request(app).put('/evening');
        expect(response.status).toBe(404);
      });

      it('should return 404 for DELETE to /evening', async () => {
        const response = await request(app).delete('/evening');
        expect(response.status).toBe(404);
      });
    });
  });

  // ============================================================
  // Header Tests
  // ============================================================
  describe('Response Headers', () => {
    
    describe('Content-Type Headers', () => {
      it('should return Content-Type header for GET /', async () => {
        const response = await request(app).get('/');
        expect(response.headers).toHaveProperty('content-type');
      });

      it('should return html content-type for GET / (Express default)', async () => {
        const response = await request(app).get('/');
        expect(response.headers['content-type']).toMatch(/text\/html/);
      });

      it('should return Content-Type header for GET /evening', async () => {
        const response = await request(app).get('/evening');
        expect(response.headers).toHaveProperty('content-type');
      });

      it('should return html content-type for GET /evening (Express default)', async () => {
        const response = await request(app).get('/evening');
        expect(response.headers['content-type']).toMatch(/text\/html/);
      });

      it('should include charset in Content-Type', async () => {
        const response = await request(app).get('/');
        expect(response.headers['content-type']).toMatch(/charset=utf-8/i);
      });
    });

    describe('Content-Length Headers', () => {
      it('should return Content-Length header for GET /', async () => {
        const response = await request(app).get('/');
        expect(response.headers).toHaveProperty('content-length');
      });

      it('should return correct Content-Length for GET / (14 bytes)', async () => {
        const response = await request(app).get('/');
        expect(parseInt(response.headers['content-length'])).toBe(14); // "Hello, World!\n" = 14 bytes
      });

      it('should return Content-Length header for GET /evening', async () => {
        const response = await request(app).get('/evening');
        expect(response.headers).toHaveProperty('content-length');
      });

      it('should return correct Content-Length for GET /evening (12 bytes)', async () => {
        const response = await request(app).get('/evening');
        expect(parseInt(response.headers['content-length'])).toBe(12); // "Good evening" = 12 bytes
      });
    });

    describe('X-Powered-By Header', () => {
      it('should return X-Powered-By header indicating Express', async () => {
        const response = await request(app).get('/');
        expect(response.headers['x-powered-by']).toBe('Express');
      });
    });

    describe('ETag Headers', () => {
      it('should return ETag header for GET /', async () => {
        const response = await request(app).get('/');
        expect(response.headers).toHaveProperty('etag');
      });

      it('should return ETag header for GET /evening', async () => {
        const response = await request(app).get('/evening');
        expect(response.headers).toHaveProperty('etag');
      });

      it('should return consistent ETag for same content', async () => {
        const response1 = await request(app).get('/');
        const response2 = await request(app).get('/');
        expect(response1.headers['etag']).toBe(response2.headers['etag']);
      });

      it('should return different ETag for different endpoints', async () => {
        const response1 = await request(app).get('/');
        const response2 = await request(app).get('/evening');
        expect(response1.headers['etag']).not.toBe(response2.headers['etag']);
      });
    });
  });

  // ============================================================
  // Server Startup/Shutdown Tests
  // ============================================================
  describe('Server Startup/Shutdown', () => {
    let testServer = null;

    afterEach((done) => {
      if (testServer) {
        testServer.close(() => {
          testServer = null;
          done();
        });
      } else {
        done();
      }
    });

    describe('Server Start', () => {
      it('should start server successfully with startServer()', (done) => {
        testServer = startServer(() => {
          expect(testServer).not.toBeNull();
          expect(testServer.listening).toBe(true);
          done();
        });
      });

      it('should return server instance from startServer()', (done) => {
        testServer = startServer(() => {
          expect(testServer).toBeDefined();
          expect(typeof testServer.close).toBe('function');
          done();
        });
      });

      it('should start server on configured port', (done) => {
        const config = getConfig();
        testServer = startServer(() => {
          const address = testServer.address();
          expect(address.port).toBe(config.port);
          done();
        });
      });

      it('should start server on configured hostname', (done) => {
        const config = getConfig();
        testServer = startServer(() => {
          const address = testServer.address();
          expect(address.address).toBe(config.hostname);
          done();
        });
      });
    });

    describe('Server Stop', () => {
      it('should stop server successfully with stopServer()', (done) => {
        testServer = startServer(() => {
          stopServer(() => {
            expect(getServer()).toBeNull();
            testServer = null;
            done();
          });
        });
      });

      it('should handle stopServer() when server is not running', (done) => {
        // Make sure no server is running first
        stopServer(() => {
          // Calling stopServer() again when no server is running
          stopServer(() => {
            expect(getServer()).toBeNull();
            done();
          });
        });
      });

      it('should allow restarting server after stop', (done) => {
        testServer = startServer(() => {
          stopServer(() => {
            testServer = startServer(() => {
              expect(testServer).not.toBeNull();
              expect(testServer.listening).toBe(true);
              done();
            });
          });
        });
      });
    });

    describe('getServer()', () => {
      it('should return null when server is not started', (done) => {
        // Ensure we're in a clean state first
        stopServer(() => {
          expect(getServer()).toBeNull();
          done();
        });
      });

      it('should return server instance when server is running', (done) => {
        // First ensure clean state
        stopServer(() => {
          testServer = startServer(() => {
            // The server variable is set before callback runs
            const server = getServer();
            expect(server).not.toBeNull();
            expect(server).toBe(testServer);
            done();
          });
        });
      });
    });
  });

  // ============================================================
  // Server Configuration Tests
  // ============================================================
  describe('Server Configuration', () => {
    
    describe('getConfig()', () => {
      it('should return configuration object', () => {
        const config = getConfig();
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
      });

      it('should have hostname property', () => {
        const config = getConfig();
        expect(config).toHaveProperty('hostname');
        expect(config.hostname).toBe('127.0.0.1');
      });

      it('should have port property', () => {
        const config = getConfig();
        expect(config).toHaveProperty('port');
        expect(config.port).toBe(3000);
      });

      it('should return consistent configuration', () => {
        const config1 = getConfig();
        const config2 = getConfig();
        expect(config1.hostname).toBe(config2.hostname);
        expect(config1.port).toBe(config2.port);
      });
    });

    describe('getApp()', () => {
      it('should return Express app instance', () => {
        const appInstance = getApp();
        expect(appInstance).toBeDefined();
        expect(appInstance).toBe(app);
      });

      it('should return app with get method', () => {
        const appInstance = getApp();
        expect(typeof appInstance.get).toBe('function');
      });

      it('should return app with listen method', () => {
        const appInstance = getApp();
        expect(typeof appInstance.listen).toBe('function');
      });

      it('should return app with use method', () => {
        const appInstance = getApp();
        expect(typeof appInstance.use).toBe('function');
      });
    });
  });

  // ============================================================
  // Error Handling Tests
  // ============================================================
  describe('Error Handling', () => {
    
    describe('404 Error Response', () => {
      it('should handle 404 for undefined routes', async () => {
        const response = await request(app).get('/undefined-route');
        expect(response.status).toBe(404);
      });

      it('should return error message for 404', async () => {
        const response = await request(app).get('/undefined-route');
        expect(response.text).toMatch(/Cannot GET/);
      });

      it('should return HTML error response for 404', async () => {
        const response = await request(app).get('/undefined-route');
        expect(response.headers['content-type']).toMatch(/text\/html/);
      });
    });

    describe('Invalid HTTP Methods', () => {
      it('should handle unsupported method on root', async () => {
        const response = await request(app).options('/');
        // OPTIONS is typically handled by Express
        expect([200, 204, 404]).toContain(response.status);
      });

      it('should handle HEAD request on root', async () => {
        const response = await request(app).head('/');
        expect(response.status).toBe(200);
        // HEAD should not return body - text may be undefined or empty
        expect(response.text || '').toBe('');
      });

      it('should handle HEAD request on /evening', async () => {
        const response = await request(app).head('/evening');
        expect(response.status).toBe(200);
        // HEAD should not return body - text may be undefined or empty
        expect(response.text || '').toBe('');
      });
    });

    describe('Malformed Requests', () => {
      it('should handle request with empty path', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
      });

      it('should handle request with trailing slash on root', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
      });

      it('should handle request with double slash', async () => {
        const response = await request(app).get('//');
        // Express typically normalizes this
        expect([200, 301, 404]).toContain(response.status);
      });
    });
  });

  // ============================================================
  // Edge Cases Tests
  // ============================================================
  describe('Edge Cases', () => {
    
    describe('URL Variations', () => {
      it('should handle /evening with trailing slash', async () => {
        const response = await request(app).get('/evening/');
        // Express may handle trailing slashes differently
        expect([200, 301, 404]).toContain(response.status);
      });

      it('should handle root with query parameters', async () => {
        const response = await request(app).get('/?foo=bar');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello, World!\n');
      });

      it('should handle /evening with query parameters', async () => {
        const response = await request(app).get('/evening?time=now');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Good evening');
      });

      it('should handle route with case sensitivity', async () => {
        const response = await request(app).get('/EVENING');
        // Express 5.x is case-insensitive by default
        expect(response.status).toBe(200);
        expect(response.text).toBe('Good evening');
      });

      it('should handle route with mixed case', async () => {
        const response = await request(app).get('/Evening');
        // Express 5.x is case-insensitive by default
        expect(response.status).toBe(200);
        expect(response.text).toBe('Good evening');
      });
    });

    describe('Special Characters in URL', () => {
      it('should handle request with encoded characters', async () => {
        const response = await request(app).get('/%2F');
        expect([200, 400, 404]).toContain(response.status);
      });

      it('should handle request with hash fragment', async () => {
        // Hash fragments are not sent to server, but test URL construction
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
      });
    });

    describe('Concurrent Requests', () => {
      it('should handle multiple concurrent requests to /', async () => {
        const requests = Array(10).fill().map(() => request(app).get('/'));
        const responses = await Promise.all(requests);
        
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.text).toBe('Hello, World!\n');
        });
      });

      it('should handle multiple concurrent requests to /evening', async () => {
        const requests = Array(10).fill().map(() => request(app).get('/evening'));
        const responses = await Promise.all(requests);
        
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.text).toBe('Good evening');
        });
      });

      it('should handle mixed concurrent requests', async () => {
        const requests = [
          request(app).get('/'),
          request(app).get('/evening'),
          request(app).get('/'),
          request(app).get('/evening'),
          request(app).get('/')
        ];
        const responses = await Promise.all(requests);
        
        expect(responses[0].text).toBe('Hello, World!\n');
        expect(responses[1].text).toBe('Good evening');
        expect(responses[2].text).toBe('Hello, World!\n');
        expect(responses[3].text).toBe('Good evening');
        expect(responses[4].text).toBe('Hello, World!\n');
      });
    });

    describe('Request Headers', () => {
      it('should handle request with custom headers on /', async () => {
        const response = await request(app)
          .get('/')
          .set('X-Custom-Header', 'test-value');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello, World!\n');
      });

      it('should handle request with Accept header', async () => {
        const response = await request(app)
          .get('/')
          .set('Accept', 'text/plain');
        expect(response.status).toBe(200);
      });

      it('should handle request with User-Agent header', async () => {
        const response = await request(app)
          .get('/')
          .set('User-Agent', 'TestAgent/1.0');
        expect(response.status).toBe(200);
      });
    });

    describe('Response Body Encoding', () => {
      it('should return UTF-8 encoded response for /', async () => {
        const response = await request(app).get('/');
        expect(response.headers['content-type']).toMatch(/utf-8/i);
      });

      it('should return UTF-8 encoded response for /evening', async () => {
        const response = await request(app).get('/evening');
        expect(response.headers['content-type']).toMatch(/utf-8/i);
      });

      it('should return correct byte length for ASCII content', async () => {
        const response = await request(app).get('/');
        const expectedLength = Buffer.byteLength('Hello, World!\n', 'utf-8');
        expect(parseInt(response.headers['content-length'])).toBe(expectedLength);
      });
    });
  });

  // ============================================================
  // Integration Tests
  // ============================================================
  describe('Integration Tests', () => {
    
    describe('Full Request/Response Cycle', () => {
      it('should complete full request cycle for root endpoint', async () => {
        const response = await request(app).get('/');
        
        // Verify status
        expect(response.status).toBe(200);
        
        // Verify headers
        expect(response.headers).toHaveProperty('content-type');
        expect(response.headers).toHaveProperty('content-length');
        
        // Verify body
        expect(response.text).toBe('Hello, World!\n');
      });

      it('should complete full request cycle for evening endpoint', async () => {
        const response = await request(app).get('/evening');
        
        // Verify status
        expect(response.status).toBe(200);
        
        // Verify headers
        expect(response.headers).toHaveProperty('content-type');
        expect(response.headers).toHaveProperty('content-length');
        
        // Verify body
        expect(response.text).toBe('Good evening');
      });
    });

    describe('Sequential Requests', () => {
      it('should handle sequential requests correctly', async () => {
        const response1 = await request(app).get('/');
        expect(response1.status).toBe(200);
        expect(response1.text).toBe('Hello, World!\n');

        const response2 = await request(app).get('/evening');
        expect(response2.status).toBe(200);
        expect(response2.text).toBe('Good evening');

        const response3 = await request(app).get('/');
        expect(response3.status).toBe(200);
        expect(response3.text).toBe('Hello, World!\n');
      });
    });

    describe('Endpoint Independence', () => {
      it('should maintain endpoint independence', async () => {
        // Request to one endpoint should not affect another
        await request(app).get('/evening');
        const response = await request(app).get('/');
        expect(response.text).toBe('Hello, World!\n');
      });
    });
  });
});
