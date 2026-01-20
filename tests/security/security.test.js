/**
 * Security Test Suite
 * 
 * Comprehensive tests for verifying security middleware functionality.
 * Tests cover:
 * - Security headers (Helmet.js)
 * - Rate limiting (express-rate-limit)
 * - CORS policy enforcement
 * - X-Powered-By header removal
 * 
 * @module tests/security/security.test
 */

const request = require('supertest');
const { app } = require('../../server');

describe('Security Middleware', () => {
  describe('Security Headers (Helmet)', () => {
    it('should set Content-Security-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('should set X-Content-Type-Options header to nosniff', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should set Cross-Origin-Opener-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['cross-origin-opener-policy']).toBeDefined();
    });

    it('should set Cross-Origin-Resource-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['cross-origin-resource-policy']).toBeDefined();
    });

    it('should set Origin-Agent-Cluster header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['origin-agent-cluster']).toBeDefined();
    });

    it('should set Referrer-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['referrer-policy']).toBeDefined();
    });

    it('should set Strict-Transport-Security header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['strict-transport-security']).toBeDefined();
    });

    it('should set X-DNS-Prefetch-Control header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('should set X-Download-Options header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-download-options']).toBe('noopen');
    });

    it('should set X-Permitted-Cross-Domain-Policies header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-permitted-cross-domain-policies']).toBe('none');
    });

    it('should NOT include X-Powered-By header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should apply security headers to /evening endpoint', async () => {
      const res = await request(app).get('/evening');
      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('should apply security headers to 404 responses', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.headers['content-security-policy']).toBeDefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CORS Policy', () => {
    it('should not include Access-Control-Allow-Origin header by default', async () => {
      const res = await request(app)
        .get('/')
        .set('Origin', 'http://evil.com');
      // With origin: false, CORS middleware doesn't add CORS headers
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should not allow cross-origin requests from unauthorized origins', async () => {
      const res = await request(app)
        .options('/')
        .set('Origin', 'http://unauthorized.com')
        .set('Access-Control-Request-Method', 'GET');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should handle preflight requests without CORS headers when origin denied', async () => {
      const res = await request(app)
        .options('/')
        .set('Origin', 'http://localhost')
        .set('Access-Control-Request-Method', 'GET');
      // With origin: false, CORS denies all origins, so preflight returns 200 without CORS headers
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should include RateLimit header in response', async () => {
      const res = await request(app).get('/');
      // draft-8 uses combined 'ratelimit' header
      expect(res.headers['ratelimit']).toBeDefined();
    });

    it('should allow requests under the limit', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });

    it('should return correct response body after rate limit check', async () => {
      const res = await request(app).get('/');
      expect(res.text).toBe('Hello, World!\n');
    });

    it('should track rate limit for multiple endpoints', async () => {
      const res1 = await request(app).get('/');
      const res2 = await request(app).get('/evening');
      
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.headers['ratelimit']).toBeDefined();
      expect(res2.headers['ratelimit']).toBeDefined();
    });
  });

  describe('Response Preservation', () => {
    it('should preserve original response content for GET /', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Hello, World!\n');
    });

    it('should preserve original response content for GET /evening', async () => {
      const res = await request(app).get('/evening');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Good evening');
    });

    it('should maintain 404 handling for undefined routes', async () => {
      const res = await request(app).get('/undefined');
      expect(res.status).toBe(404);
    });

    it('should maintain correct Content-Type headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('should maintain correct Content-Length headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['content-length']).toBe('14');
    });

    it('should maintain ETag headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['etag']).toBeDefined();
    });
  });

  describe('Security Configuration', () => {
    it('should have security configuration module available', () => {
      const securityConfig = require('../../config/security');
      expect(securityConfig).toBeDefined();
      expect(typeof securityConfig.isSecurityEnabled).toBe('boolean');
    });

    it('should have CORS configuration module available', () => {
      const corsConfig = require('../../config/cors');
      expect(corsConfig).toBeDefined();
      expect(corsConfig.methods).toContain('GET');
    });

    it('should have rate limit configuration module available', () => {
      const rateLimitConfig = require('../../config/rateLimit');
      expect(rateLimitConfig).toBeDefined();
      expect(rateLimitConfig.windowMs).toBeGreaterThan(0);
      expect(rateLimitConfig.limit).toBeGreaterThan(0);
    });

    it('should have default rate limit window of 15 minutes', () => {
      const rateLimitConfig = require('../../config/rateLimit');
      expect(rateLimitConfig.windowMs).toBe(900000);
    });

    it('should have default rate limit of 100 requests', () => {
      const rateLimitConfig = require('../../config/rateLimit');
      expect(rateLimitConfig.limit).toBe(100);
    });
  });
});
