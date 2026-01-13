/**
 * @fileoverview Security Headers Test Suite
 * 
 * Tests to verify that Helmet.js security headers are correctly applied
 * to all HTTP responses from the server.
 * 
 * @module tests/security/headers
 */

'use strict';

const request = require('supertest');
const app = require('../../server');

/**
 * Security Headers Test Suite
 * 
 * Verifies that all required security headers are present in responses
 * and have appropriate values per OWASP guidelines.
 */
describe('Security Headers', () => {
  /**
   * Test that Content-Security-Policy header is present
   */
  describe('Content-Security-Policy', () => {
    it('should include Content-Security-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('should have restrictive default-src directive', async () => {
      const res = await request(app).get('/');
      const csp = res.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
    });

    it('should have restrictive script-src directive', async () => {
      const res = await request(app).get('/');
      const csp = res.headers['content-security-policy'];
      expect(csp).toContain("script-src 'self'");
    });
  });

  /**
   * Test Strict-Transport-Security (HSTS) header
   */
  describe('Strict-Transport-Security (HSTS)', () => {
    it('should include Strict-Transport-Security header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['strict-transport-security']).toBeDefined();
    });

    it('should have max-age directive', async () => {
      const res = await request(app).get('/');
      const hsts = res.headers['strict-transport-security'];
      expect(hsts).toMatch(/max-age=\d+/);
    });

    it('should include includeSubDomains directive', async () => {
      const res = await request(app).get('/');
      const hsts = res.headers['strict-transport-security'];
      expect(hsts.toLowerCase()).toContain('includesubdomains');
    });
  });

  /**
   * Test X-Content-Type-Options header
   */
  describe('X-Content-Type-Options', () => {
    it('should include X-Content-Type-Options header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-content-type-options']).toBeDefined();
    });

    it('should be set to nosniff', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  /**
   * Test X-Frame-Options header
   */
  describe('X-Frame-Options', () => {
    it('should include X-Frame-Options header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should prevent framing (DENY or SAMEORIGIN)', async () => {
      const res = await request(app).get('/');
      const xFrameOptions = res.headers['x-frame-options'].toUpperCase();
      expect(['DENY', 'SAMEORIGIN']).toContain(xFrameOptions);
    });
  });

  /**
   * Test X-DNS-Prefetch-Control header
   */
  describe('X-DNS-Prefetch-Control', () => {
    it('should include X-DNS-Prefetch-Control header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    });

    it('should be set to off', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
    });
  });

  /**
   * Test Referrer-Policy header
   */
  describe('Referrer-Policy', () => {
    it('should include Referrer-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['referrer-policy']).toBeDefined();
    });

    it('should have a secure policy value', async () => {
      const res = await request(app).get('/');
      const policy = res.headers['referrer-policy'];
      const secureValues = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin'
      ];
      expect(secureValues).toContain(policy);
    });
  });

  /**
   * Test Cross-Origin-Opener-Policy header
   */
  describe('Cross-Origin-Opener-Policy', () => {
    it('should include Cross-Origin-Opener-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['cross-origin-opener-policy']).toBeDefined();
    });
  });

  /**
   * Test Cross-Origin-Resource-Policy header
   */
  describe('Cross-Origin-Resource-Policy', () => {
    it('should include Cross-Origin-Resource-Policy header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['cross-origin-resource-policy']).toBeDefined();
    });
  });

  /**
   * Test that X-Powered-By is removed (security best practice)
   */
  describe('X-Powered-By Removal', () => {
    it('should NOT include X-Powered-By header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  /**
   * Test Origin-Agent-Cluster header
   */
  describe('Origin-Agent-Cluster', () => {
    it('should include Origin-Agent-Cluster header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['origin-agent-cluster']).toBeDefined();
    });

    it('should be set to ?1', async () => {
      const res = await request(app).get('/');
      expect(res.headers['origin-agent-cluster']).toBe('?1');
    });
  });

  /**
   * Test X-Permitted-Cross-Domain-Policies header
   */
  describe('X-Permitted-Cross-Domain-Policies', () => {
    it('should include X-Permitted-Cross-Domain-Policies header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-permitted-cross-domain-policies']).toBeDefined();
    });

    it('should be set to none', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-permitted-cross-domain-policies']).toBe('none');
    });
  });

  /**
   * Test X-Download-Options header (IE specific)
   */
  describe('X-Download-Options', () => {
    it('should include X-Download-Options header', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-download-options']).toBeDefined();
    });

    it('should be set to noopen', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-download-options']).toBe('noopen');
    });
  });
});

/**
 * Test security headers on different endpoints
 */
describe('Security Headers on All Endpoints', () => {
  it('should apply security headers to root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should apply security headers to health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should apply security headers to 404 responses', async () => {
    const res = await request(app).get('/nonexistent-path-12345');
    expect(res.status).toBe(404);
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
