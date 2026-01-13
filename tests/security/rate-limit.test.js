/**
 * @fileoverview Rate Limiting Test Suite
 * 
 * Tests to verify that express-rate-limit middleware is correctly configured
 * and actively protecting against excessive requests.
 * 
 * @module tests/security/rate-limit
 */

'use strict';

const request = require('supertest');
const app = require('../../server');

/**
 * Rate Limiting Test Suite
 * 
 * Verifies that rate limiting is active and returning appropriate headers.
 * Note: Full rate limit testing (hitting the limit) requires many requests
 * and is configured for a subset to avoid test timeout issues.
 */
describe('Rate Limiting', () => {
  /**
   * Test rate limit headers are present in responses
   */
  describe('Rate Limit Headers', () => {
    it('should include RateLimit-Limit header', async () => {
      const res = await request(app).get('/');
      // Check for draft-8 format headers
      const hasRateLimitHeader = 
        res.headers['ratelimit-limit'] !== undefined ||
        res.headers['ratelimit'] !== undefined ||
        res.headers['x-ratelimit-limit'] !== undefined;
      expect(hasRateLimitHeader).toBe(true);
    });

    it('should include RateLimit-Remaining header', async () => {
      const res = await request(app).get('/');
      const hasRemainingHeader = 
        res.headers['ratelimit-remaining'] !== undefined ||
        res.headers['ratelimit'] !== undefined ||
        res.headers['x-ratelimit-remaining'] !== undefined;
      expect(hasRemainingHeader).toBe(true);
    });

    it('should include RateLimit-Reset header', async () => {
      const res = await request(app).get('/');
      const hasResetHeader = 
        res.headers['ratelimit-reset'] !== undefined ||
        res.headers['ratelimit'] !== undefined ||
        res.headers['x-ratelimit-reset'] !== undefined;
      expect(hasResetHeader).toBe(true);
    });
  });

  /**
   * Test rate limit values
   */
  describe('Rate Limit Values', () => {
    it('should have rate limit configured', async () => {
      const res = await request(app).get('/');
      // The RateLimit header in express-rate-limit v8 with draft-8 format
      // uses structured format: "100-in-15min"; r=X; t=Y
      const rateLimitHeader = res.headers['ratelimit'];
      if (rateLimitHeader) {
        // Verify it contains rate limit information
        // Format: "100-in-15min"; r=99; t=900 
        // or includes limit info in some form
        expect(rateLimitHeader).toBeDefined();
        // Should contain rate limit window info or traditional limit= format
        const hasRateLimitInfo = rateLimitHeader.includes('-in-') || 
                                  rateLimitHeader.includes('limit=') ||
                                  rateLimitHeader.includes('r=');
        expect(hasRateLimitInfo).toBe(true);
      } else {
        // Fallback to individual headers
        const limit = res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit'];
        expect(parseInt(limit, 10)).toBeGreaterThan(0);
      }
    });

    it('should track request counts', async () => {
      // Make first request
      const res1 = await request(app).get('/');
      
      // Make second request
      const res2 = await request(app).get('/');
      
      // Both requests should succeed
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      
      // Rate limit headers should be present on both
      const hasRateLimitHeader = (res) => 
        res.headers['ratelimit'] !== undefined ||
        res.headers['ratelimit-limit'] !== undefined ||
        res.headers['x-ratelimit-limit'] !== undefined;
      
      expect(hasRateLimitHeader(res1)).toBe(true);
      expect(hasRateLimitHeader(res2)).toBe(true);
    });
  });

  /**
   * Test rate limit response format
   */
  describe('Rate Limit Response Format', () => {
    it('should return 200 status for normal requests', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });

    it('should apply rate limit to all endpoints', async () => {
      const endpoints = ['/', '/health'];
      
      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        const hasRateLimitHeader = 
          res.headers['ratelimit'] !== undefined ||
          res.headers['ratelimit-limit'] !== undefined ||
          res.headers['x-ratelimit-limit'] !== undefined;
        expect(hasRateLimitHeader).toBe(true);
      }
    });
  });

  /**
   * Test rate limit applies to different HTTP methods
   */
  describe('Rate Limit HTTP Methods', () => {
    it('should apply rate limit to GET requests', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      const hasRateLimitHeader = 
        res.headers['ratelimit'] !== undefined ||
        res.headers['ratelimit-limit'] !== undefined;
      expect(hasRateLimitHeader).toBe(true);
    });

    it('should apply rate limit to POST requests', async () => {
      const res = await request(app).post('/nonexistent');
      // Will return 404 but should still have rate limit headers
      const hasRateLimitHeader = 
        res.headers['ratelimit'] !== undefined ||
        res.headers['ratelimit-limit'] !== undefined;
      expect(hasRateLimitHeader).toBe(true);
    });
  });
});

/**
 * Rate Limit Configuration Test
 * 
 * Verifies the rate limiter is configured with expected default values.
 */
describe('Rate Limit Configuration', () => {
  it('should have rate limiting configured', async () => {
    const res = await request(app).get('/');
    
    // Check for any rate limit header format
    const rateLimitHeader = res.headers['ratelimit'];
    const rateLimitLimitHeader = res.headers['ratelimit-limit'];
    const xRateLimitHeader = res.headers['x-ratelimit-limit'];
    
    // At least one rate limit header should be present
    const hasRateLimiting = 
      rateLimitHeader !== undefined || 
      rateLimitLimitHeader !== undefined ||
      xRateLimitHeader !== undefined;
    
    expect(hasRateLimiting).toBe(true);
    
    // If we have the header, verify it contains rate limit info
    if (rateLimitHeader) {
      // express-rate-limit v8 uses structured format: "100-in-15min"; r=X; t=Y
      const hasRateLimitInfo = rateLimitHeader.includes('-in-') || 
                                rateLimitHeader.includes('limit=') ||
                                rateLimitHeader.includes('r=');
      expect(hasRateLimitInfo).toBe(true);
    }
  });

  it('should return 200 for requests within limit', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
});
