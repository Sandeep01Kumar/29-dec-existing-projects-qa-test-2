# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification

### 0.1.1 Core Security Objective

Based on the security concern described, the Blitzy platform understands that the security vulnerability to resolve is the **complete absence of security infrastructure** in the current minimal Node.js application. The application currently operates as a "test fixture" with zero external dependencies and no security controls.

**Vulnerability Category:** Configuration weakness + Missing security controls (Multiple vulnerabilities)

**Severity Level:** High - The application lacks fundamental security protections that are considered mandatory for any production-facing web service in 2025.

**Detailed Security Requirements:**

- **Security Headers Implementation**: Add HTTP security headers (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.) to protect against common web attacks including XSS, clickjacking, and MIME-type sniffing
- **Input Validation**: Implement request validation and sanitization to prevent injection attacks and ensure data integrity
- **Rate Limiting**: Add request throttling to protect against denial-of-service attacks and brute-force attempts
- **HTTPS Support**: Enable TLS/SSL encrypted connections to ensure data confidentiality and integrity in transit
- **Dependency Updates**: Migrate from zero-dependency native `http` module to Express.js framework with security middleware
- **Helmet.js Integration**: Add the Helmet middleware to automatically configure security headers following OWASP best practices
- **CORS Configuration**: Implement Cross-Origin Resource Sharing policies to control which domains can access the API

**Implicit Security Needs Identified:**

- Migration from native `http` module to Express.js (prerequisite for middleware-based security)
- TLS certificate management infrastructure
- Environment-based configuration for security settings (development vs. production)
- Error handling that doesn't leak sensitive information
- Secure defaults with configurable overrides

### 0.1.2 Special Instructions and Constraints

**Critical Directives:**
- The current README states "test project for backprop integration. Do not touch!" - however, security hardening overrides this constraint as per the explicit user request
- The existing architectural decision (ADR-001/ADR-002) to use "zero external frameworks" will be superseded by this security implementation
- Maintain the existing "Hello, World!" response behavior to preserve backward compatibility

**Security Requirements:**
- Follow OWASP security guidelines for Node.js applications
- Use TLS 1.3 as the preferred protocol with TLS 1.2 fallback
- Implement security headers according to 2025 best practices
- Ensure all security configurations are environment-aware

**User Examples Preserved:**
- User Example: "Implement security headers, input validation, rate limiting, and HTTPS support"
- User Example: "Update dependencies, add helmet.js for security middleware"
- User Example: "Configure proper CORS policies"

**Web Search Requirements Completed:**
- Helmet.js: v8.1.0 (latest stable)
- Express.js: v5.2.1 (latest stable, major v5 release)
- express-rate-limit: v8.2.1 (latest stable)
- cors: v2.8.5 (latest stable)
- express-validator: v7.3.1 (latest stable)

**Change Scope:** Comprehensive - This represents a fundamental architectural transformation from a test fixture to a security-hardened application

### 0.1.3 Technical Interpretation

This security vulnerability translates to the following technical fix strategy:

**Architecture Transformation:**
- To resolve the **lack of framework support**, we will migrate from native `http` module to Express.js v5.2.1
- To resolve the **missing security headers**, we will integrate helmet.js v8.1.0 as middleware
- To resolve the **absence of rate limiting**, we will implement express-rate-limit v8.2.1
- To resolve the **lack of input validation**, we will add express-validator v7.3.1
- To resolve the **missing CORS policy**, we will configure cors v2.8.5 middleware
- To resolve the **HTTP-only communication**, we will implement HTTPS using Node.js native `https` module with self-signed certificates for development

**User's Understanding Level:** Explicit security requirements - The user has clearly specified the security controls needed (headers, validation, rate limiting, HTTPS, Helmet.js, CORS) with specific library recommendations.

**Fix Approach Summary:**
```
Current State: Native http module → No security → Localhost only
Target State:  Express + HTTPS → Helmet + CORS + Rate Limit + Validation → Production-ready
```

## 0.2 Vulnerability Research and Analysis

### 0.2.1 Initial Assessment

**Security-Related Information Extracted:**

- **CVE Numbers Mentioned:** None explicitly mentioned - this is a proactive security hardening rather than CVE remediation
- **Vulnerability Names:** 
  - Missing HTTP security headers (CWE-693: Protection Mechanism Failure)
  - Lack of input validation (CWE-20: Improper Input Validation)
  - No rate limiting (CWE-770: Allocation of Resources Without Limits)
  - Unencrypted communication (CWE-319: Cleartext Transmission of Sensitive Information)
- **Affected Packages:** Current application has zero dependencies - vulnerability is architectural absence
- **Symptoms Described:** Application uses plain HTTP with no security middleware
- **Security Advisories Referenced:** None - proactive implementation requested

### 0.2.2 Required Web Research

**Research Conducted:**

| Source | Finding | Relevance |
|--------|---------|-----------|
| npm registry | Helmet.js v8.1.0 is the latest stable version | Provides 15 security headers by default |
| npm registry | Express.js v5.2.1 is the current latest version | Required for middleware support |
| npm registry | express-rate-limit v8.2.1 is latest | Supports draft-8 rate limit headers |
| npm registry | cors v2.8.5 is latest (stable for 7 years) | Industry standard for CORS handling |
| npm registry | express-validator v7.3.1 is latest | Requires Node.js 14+ |
| Node.js TLS docs | TLS 1.3 is preferred, TLS 1.2 is minimum | Default cipher suites are secure |
| OWASP | Security headers are mandatory for web apps | CSP, HSTS, X-Frame-Options are critical |

**Key Research Findings:**

- "Helmet sets the following headers by default: Content-Security-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Origin-Agent-Cluster, Referrer-Policy, Strict-Transport-Security, X-Content-Type-Options, X-DNS-Prefetch-Control"
- Express.js v5.0 "focuses on simplifying the codebase, improving security, and dropping support for older Node.js versions"
- "In 2025, running a production Node.js application over plain HTTP is professional negligence"
- Express-rate-limit "provides flexible protection with over 10 million weekly downloads"

### 0.2.3 Vulnerability Classification

| Vulnerability | Type | Attack Vector | Exploitability | Impact | Root Cause |
|---------------|------|---------------|----------------|--------|------------|
| Missing Security Headers | Configuration weakness | Network | High | Confidentiality, Integrity | No Helmet.js or manual headers |
| No Input Validation | Injection vulnerability | Network | High | Confidentiality, Integrity, Availability | No validation middleware |
| No Rate Limiting | Resource exhaustion | Network | High | Availability | No throttling controls |
| HTTP-only Communication | Data exposure | Network (Adjacent) | Medium | Confidentiality | No TLS/HTTPS implementation |
| Missing CORS Policy | Cross-origin attacks | Network | Medium | Integrity | No CORS middleware |
| No Framework | Security debt | Local | Low | All | Native http module limits security options |

**Detailed Classification:**

- **Vulnerability Type:** Multiple - Configuration weakness, Missing security controls, Architectural security debt
- **Attack Vector:** Network - All vulnerabilities are exploitable over the network
- **Exploitability:** High - Standard tools can exploit missing security headers and lack of rate limiting
- **Impact:** Confidentiality (data exposure via HTTP), Integrity (XSS/CSRF via missing headers), Availability (DoS via no rate limiting)
- **Root Cause:** The application was designed as a minimal test fixture with intentional zero dependencies, creating security debt

### 0.2.4 Web Search Research Conducted

**Official Security Advisories Reviewed:**

- OWASP Secure Headers Project: Recommends Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options as minimum headers
- Node.js Security Best Practices: TLS 1.3 with TLS 1.2 fallback, use secure cipher suites
- npm Security Advisories: No known vulnerabilities in target package versions

**Recommended Mitigation Strategies:**

1. **Security Headers:** Implement Helmet.js with default configuration (covers 90% of header requirements)
2. **Input Validation:** Use express-validator middleware chains for request sanitization
3. **Rate Limiting:** Apply express-rate-limit with configurable windows (15-minute default)
4. **HTTPS:** Use Node.js native `https` module with proper TLS configuration
5. **CORS:** Configure cors middleware with explicit origin whitelist

**Alternative Solutions Considered:**

| Alternative | Trade-offs | Decision |
|-------------|------------|----------|
| Fastify instead of Express | Better performance, less ecosystem | Rejected - User specified Express/Helmet |
| Native headers instead of Helmet | More control, more maintenance | Rejected - Helmet is industry standard |
| Custom rate limiter | Full control | Rejected - express-rate-limit is battle-tested |
| NGINX proxy for HTTPS | Offloads TLS | Out of scope - Node.js direct implementation requested |

## 0.3 Security Scope Analysis

### 0.3.1 Affected Component Discovery

**Repository Search Results:**

The repository has been exhaustively searched. This is a minimal test fixture with the following structure:

```
/
├── package.json           # No dependencies - AFFECTED
├── package-lock.json      # Empty lockfile - AFFECTED
├── server.js              # Native http module - AFFECTED (PRIMARY)
├── README.md              # Documentation - AFFECTED
├── LoginTest.java         # Intentional placeholder - IGNORED
├── products.csv           # Test data - UNAFFECTED
└── transactions.csv       # Test data - UNAFFECTED
```

**Vulnerability Scope:** Affects 4 files across 1 directory (root)

**Search Patterns Employed:**

| Search Pattern | Files Found | Notes |
|----------------|-------------|-------|
| `require('http')` | server.js | Native HTTP module usage |
| `package.json` | package.json | Zero dependencies declared |
| `*.js` | server.js | Single JavaScript file |
| `*.config.*` | None | No configuration files exist |
| `Dockerfile*` | None | No containerization |
| `.github/workflows/*` | None | No CI/CD pipelines |

### 0.3.2 Root Cause Identification

**Identified Vulnerability Source:**

The identified vulnerability exists in **server.js** due to the architectural decision to use Node.js native `http` module with zero external dependencies.

**Investigation Reveals:**

```javascript
// Current server.js (lines 1-14)
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

**Root Causes:**
1. **Native HTTP Module:** Cannot support middleware pattern required for security controls
2. **No Security Headers:** Response only sets `Content-Type`, no security headers
3. **No Input Validation:** Request handler doesn't validate any input
4. **No Rate Limiting:** All requests processed without throttling
5. **HTTP Protocol:** Uses unencrypted HTTP instead of HTTPS
6. **Localhost Binding:** Currently binds to 127.0.0.1 only (limited network exposure)

**Vulnerability Propagation Trace:**

| Location | Impact | Severity |
|----------|--------|----------|
| server.js:1 | Uses `http` instead of `https` | High |
| server.js:5-8 | No middleware chain | High |
| server.js:7 | Only Content-Type header set | High |
| server.js:8 | No input validation on request | Medium |
| package.json | Zero security dependencies | High |

### 0.3.3 Current State Assessment

**Vulnerable Component Current State:**

| Component | Current State | Security Risk |
|-----------|---------------|---------------|
| HTTP Module | `const http = require('http')` | Unencrypted traffic |
| Server Headers | Only `Content-Type: text/plain` | Missing 10+ security headers |
| Request Handler | Direct passthrough, no validation | Injection risk |
| Dependencies | Zero (`"dependencies": {}`) | No security middleware available |
| Network Binding | `127.0.0.1:3000` (localhost only) | Limited exposure (good) |
| Error Handling | None | Potential info leakage |
| Rate Limiting | None | DoS vulnerability |
| CORS | None | Cross-origin unrestricted |

**Scope of Exposure:**

- **Current:** Internal only - Application binds to localhost (127.0.0.1)
- **After Implementation:** Will be configurable for public-facing deployment
- **Risk Assessment:** Low immediate risk due to localhost binding, but architecture prevents secure deployment

**Package Version Analysis:**

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| express | Not installed | 5.2.1 | Foundation for middleware |
| helmet | Not installed | 8.1.0 | Security headers |
| cors | Not installed | 2.8.5 | CORS policy |
| express-rate-limit | Not installed | 8.2.1 | Rate limiting |
| express-validator | Not installed | 7.3.1 | Input validation |

**Configuration Exposure Analysis:**

The application currently has no configuration files. Security implementation will require:

1. **Environment Configuration:** Security settings that vary by environment
2. **TLS Certificates:** Key and certificate files for HTTPS
3. **CORS Whitelist:** Allowed origins configuration
4. **Rate Limit Settings:** Window duration and request limits

## 0.4 Version Compatibility Research

### 0.4.1 Secure Version Identification

**Web Search Results for Package Versions:**

| Package | Latest Version | Release Date | Node.js Requirement | Security Status |
|---------|----------------|--------------|---------------------|-----------------|
| express | 5.2.1 | Dec 2025 | ≥18.0.0 | ✅ No known vulnerabilities |
| helmet | 8.1.0 | Mar 2025 | ≥18.0.0 | ✅ No known vulnerabilities |
| cors | 2.8.5 | 2018 | Any | ✅ Stable, no vulnerabilities |
| express-rate-limit | 8.2.1 | Nov 2025 | ≥18.0.0 | ✅ No known vulnerabilities |
| express-validator | 7.3.1 | Nov 2025 | ≥14.0.0 | ✅ No known vulnerabilities |

**Rationale for Selected Versions:**

- **Express 5.2.1:** Latest stable with improved security, Promise support for async middleware, ReDoS mitigation in path-to-regexp
- **Helmet 8.1.0:** Latest stable with 15 security middleware functions, zero dependencies
- **cors 2.8.5:** Industry standard, stable for 7 years, widely audited
- **express-rate-limit 8.2.1:** Latest with draft-8 rate limit headers support, IPv6 subnet masking
- **express-validator 7.3.1:** Latest stable with improved TypeScript support, built on validator.js

### 0.4.2 Compatibility Verification

**Node.js Compatibility Matrix:**

| Package | Current Node.js (v20.19.6) | Target Node.js (v24 LTS) | Compatibility |
|---------|---------------------------|-------------------------|---------------|
| express@5.2.1 | ✅ Supported | ✅ Supported | Requires ≥18 |
| helmet@8.1.0 | ✅ Supported | ✅ Supported | Requires ≥18 |
| cors@2.8.5 | ✅ Supported | ✅ Supported | Any version |
| express-rate-limit@8.2.1 | ✅ Supported | ✅ Supported | Requires ≥18 |
| express-validator@7.3.1 | ✅ Supported | ✅ Supported | Requires ≥14 |

**Inter-Package Compatibility:**

All selected packages are compatible with Express 5.x:

```
express@5.2.1
├── helmet@8.1.0 (Express middleware compatible)
├── cors@2.8.5 (Express middleware compatible)
├── express-rate-limit@8.2.1 (Express middleware compatible)
└── express-validator@7.3.1 (Express middleware compatible)
```

**Breaking Changes in Upgrade Path:**

| Package | Breaking Changes | Migration Notes |
|---------|-----------------|-----------------|
| Express 5.x | `app.del()` → `app.delete()`, Promise-based middleware | Fresh install, no migration needed |
| Helmet 8.x | Removed X-XSS-Protection (harmful), changed defaults | Use default configuration |
| express-rate-limit 8.x | `max` → `limit`, standardHeaders format | Use latest API |
| express-validator 7.x | Sanitization-only middlewares deprecated | Use validation chains |

### 0.4.3 Version Conflicts Analysis

**Potential Conflicts Identified:** None

All packages have been verified to work together:

- No peer dependency conflicts
- No shared transitive dependency version mismatches
- Express 5.x ecosystem is mature and stable as of 2025

**TLS/SSL Configuration Compatibility:**

| Node.js Version | TLS 1.3 | TLS 1.2 | Default Cipher Suite |
|-----------------|---------|---------|---------------------|
| v20.x (current) | ✅ Supported | ✅ Supported | Secure (GCM, ECDHE) |
| v24.x (target) | ✅ Supported | ✅ Supported | Enhanced security |

**NPM Lock File Strategy:**

The current `package-lock.json` has `lockfileVersion: 3` which is compatible with npm 7+ and supports:

- Deterministic installs across environments
- Automatic vulnerability detection via `npm audit`
- Workspace support if needed in future

### 0.4.4 Alternative Package Analysis

**No Alternative Packages Required** - All selected packages have active maintenance and no security vulnerabilities:

| Package | Weekly Downloads | Last Update | Maintenance Status |
|---------|-----------------|-------------|-------------------|
| express | 17,000,000+ | Dec 2025 | Active |
| helmet | 2,000,000+ | Mar 2025 | Active |
| cors | 15,000,000+ | Stable | Sustainable |
| express-rate-limit | 10,000,000+ | Nov 2025 | Healthy |
| express-validator | 800,000+ | Nov 2025 | Healthy |

## 0.5 Security Fix Design

### 0.5.1 Minimal Fix Strategy

**Principle Applied:** Transform the minimal test fixture into a security-hardened application while preserving the original "Hello, World!" functionality.

**Fix Approach:** Framework migration + Security middleware stack

**Transformation Overview:**

```
BEFORE                          AFTER
─────────────────────────────   ─────────────────────────────────────────
http.createServer()        →    express() + https.createServer()
No middleware              →    Helmet + CORS + RateLimit + Validator
Single header              →    15+ security headers
No validation              →    Input sanitization middleware
No rate limiting           →    Configurable request throttling
HTTP only                  →    HTTPS with TLS 1.3/1.2
```

### 0.5.2 Dependency Addition Strategy

**New Dependencies to Add:**

| Package | Version | Purpose | Justification |
|---------|---------|---------|---------------|
| express | ^5.2.1 | Web framework | Required foundation for middleware-based security |
| helmet | ^8.1.0 | Security headers | Industry standard, sets 15+ headers by default |
| cors | ^2.8.5 | CORS middleware | Express ecosystem standard for cross-origin policies |
| express-rate-limit | ^8.2.1 | Rate limiting | Prevents DoS, supports modern rate-limit headers |
| express-validator | ^7.3.1 | Input validation | Built on validator.js, Express-native validation chains |

**Side Effects:** None expected - Fresh installation on zero-dependency project

### 0.5.3 Code Transformation Strategy

**For server.js - Primary Application File:**

Before state: "Currently vulnerable because it uses native `http` module with no middleware support, no security headers, and unencrypted communication"

After state: "After fix, will use Express.js with HTTPS, Helmet security headers, CORS policy, rate limiting, and input validation middleware"

**Security Improvements:**

1. **HTTP → HTTPS Migration:**
   ```javascript
   // BEFORE: const http = require('http');
   // AFTER:  const https = require('https');
   //         const express = require('express');
   ```

2. **Security Headers via Helmet:**
   ```javascript
   app.use(helmet());
   // Sets CSP, HSTS, X-Content-Type-Options, etc.
   ```

3. **CORS Configuration:**
   ```javascript
   app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
   ```

4. **Rate Limiting:**
   ```javascript
   app.use(rateLimit({ windowMs: 15*60*1000, limit: 100 }));
   ```

5. **Input Validation Pattern:**
   ```javascript
   app.use(express.json());
   // Validation chains on route handlers
   ```

### 0.5.4 Configuration File Strategy

**New Configuration Files Required:**

| File | Purpose | Security Rationale |
|------|---------|-------------------|
| `certs/server.key` | TLS private key | Required for HTTPS |
| `certs/server.crt` | TLS certificate | Required for HTTPS |
| `.env.example` | Environment template | Document required configuration |

**Environment Variables to Support:**

```
NODE_ENV=production|development
PORT=3000
HTTPS_PORT=3443
ALLOWED_ORIGINS=https://example.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 0.5.5 Security Improvement Validation

**How Fix Eliminates Vulnerabilities:**

| Vulnerability | Fix Component | How It's Eliminated |
|---------------|---------------|---------------------|
| Missing security headers | Helmet.js | Sets 15+ headers automatically including CSP, HSTS, X-Frame-Options |
| No input validation | express-validator | Sanitizes and validates all incoming request data |
| No rate limiting | express-rate-limit | Limits requests per IP with configurable windows |
| HTTP-only traffic | Node.js https module | All traffic encrypted with TLS 1.3/1.2 |
| No CORS policy | cors middleware | Restricts cross-origin requests to whitelist |
| Framework limitations | Express.js | Enables middleware architecture for security |

**Verification Methods:**

1. **Security Headers:** Use Mozilla Observatory or SecurityHeaders.com to scan
2. **TLS Configuration:** Use SSL Labs test for certificate validation
3. **Rate Limiting:** Load test with `autocannon` to verify throttling
4. **Input Validation:** Unit tests with malformed input

**Rollback Plan:**

If issues arise, revert to the original `server.js` using git:

```bash
git checkout HEAD~1 -- server.js package.json package-lock.json
```

The original "Hello, World!" functionality is preserved and the localhost binding remains an option for development mode.

## 0.6 File Transformation Mapping

### 0.6.1 File-by-File Security Fix Plan

**Complete Transformation Map:**

| Target File | Transformation | Source/Reference | Security Changes |
|-------------|----------------|------------------|------------------|
| package.json | UPDATE | package.json | Add express@5.2.1, helmet@8.1.0, cors@2.8.5, express-rate-limit@8.2.1, express-validator@7.3.1, add Node.js engine requirement |
| package-lock.json | UPDATE | (auto-generated) | Will be regenerated by npm install with new dependencies |
| server.js | UPDATE | server.js | Migrate from native http to Express+HTTPS, add security middleware stack |
| certs/server.key | CREATE | (generated) | TLS private key for HTTPS (2048-bit RSA) |
| certs/server.crt | CREATE | (generated) | Self-signed TLS certificate for development |
| .env.example | CREATE | N/A | Environment variable template with security configuration |
| README.md | UPDATE | README.md | Add security configuration documentation |
| src/middleware/security.js | CREATE | server.js | Extract security middleware configuration |
| src/middleware/validation.js | CREATE | N/A | Input validation middleware with express-validator |
| src/config/security.js | CREATE | N/A | Centralized security configuration module |

### 0.6.2 Detailed Transformation Specifications

**package.json - UPDATE:**

- File: `package.json`
- Lines affected: 8-20 (dependencies section, engines section)
- Before state: "Currently has empty dependencies object `{}`"
- After state: "After fix, will include all security packages and Node.js version requirement"
- Security improvement: Declares security dependencies explicitly with version pins

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "helmet": "^8.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^8.2.1",
    "express-validator": "^7.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**server.js - UPDATE:**

- File: `server.js`
- Lines affected: All 14 lines (complete rewrite)
- Before state: "Currently uses native http module with no security"
- After state: "After fix, will use Express with full security middleware stack"
- Security improvement: Adds all security controls requested by user

**certs/server.key - CREATE:**

- File: `certs/server.key`
- Purpose: TLS private key for HTTPS server
- Generation: OpenSSL RSA 2048-bit key
- Security improvement: Enables encrypted communication

**certs/server.crt - CREATE:**

- File: `certs/server.crt`
- Purpose: Self-signed certificate for development
- Generation: X.509 certificate signed with server.key
- Security improvement: Enables HTTPS for local development

**.env.example - CREATE:**

- File: `.env.example`
- Purpose: Document all environment variables for security configuration
- Contents: PORT, HTTPS_PORT, NODE_ENV, ALLOWED_ORIGINS, rate limit settings
- Security improvement: Ensures secure configuration is documented

**src/middleware/security.js - CREATE:**

- File: `src/middleware/security.js`
- Purpose: Centralize Helmet and security header configuration
- Reference pattern: Helmet.js documentation
- Security improvement: Organized, maintainable security configuration

**src/middleware/validation.js - CREATE:**

- File: `src/middleware/validation.js`
- Purpose: Input validation middleware functions
- Reference pattern: express-validator documentation
- Security improvement: Reusable validation chains

**src/config/security.js - CREATE:**

- File: `src/config/security.js`
- Purpose: Security configuration constants and environment loading
- Security improvement: Single source of truth for security settings

### 0.6.3 Directory Structure After Implementation

```
/
├── certs/
│   ├── server.key          # CREATE - TLS private key
│   └── server.crt          # CREATE - TLS certificate
├── src/
│   ├── config/
│   │   └── security.js     # CREATE - Security configuration
│   └── middleware/
│       ├── security.js     # CREATE - Helmet/security middleware
│       └── validation.js   # CREATE - Input validation middleware
├── package.json            # UPDATE - Add dependencies
├── package-lock.json       # UPDATE - Lock file regenerated
├── server.js               # UPDATE - Express + HTTPS + middleware
├── .env.example            # CREATE - Environment template
├── README.md               # UPDATE - Security documentation
├── LoginTest.java          # UNCHANGED - Test placeholder
├── products.csv            # UNCHANGED - Test data
└── transactions.csv        # UNCHANGED - Test data
```

### 0.6.4 File Change Summary

| Action | Count | Files |
|--------|-------|-------|
| UPDATE | 4 | package.json, package-lock.json, server.js, README.md |
| CREATE | 6 | server.key, server.crt, .env.example, src/config/security.js, src/middleware/security.js, src/middleware/validation.js |
| DELETE | 0 | None |
| UNCHANGED | 3 | LoginTest.java, products.csv, transactions.csv |

**Total Files Affected:** 10 (4 updated + 6 created)

## 0.7 Dependency Inventory

### 0.7.1 Security Patches and Updates

**Package Addition Summary:**

| Registry | Package Name | Current | Target Version | Security Feature | Severity |
|----------|--------------|---------|----------------|------------------|----------|
| npm | express | Not installed | 5.2.1 | Web framework with async middleware | Foundation |
| npm | helmet | Not installed | 8.1.0 | 15+ security headers by default | High |
| npm | cors | Not installed | 2.8.5 | Cross-origin resource sharing control | Medium |
| npm | express-rate-limit | Not installed | 8.2.1 | Request throttling, DoS protection | High |
| npm | express-validator | Not installed | 7.3.1 | Input validation and sanitization | High |

**Note:** This is not a traditional "patch" scenario but rather adding security infrastructure to a zero-dependency application.

### 0.7.2 Dependency Chain Analysis

**Direct Dependencies:**

```
express@5.2.1
├── accepts@2.0.0
├── body-parser@2.1.0
├── content-disposition@1.0.0
├── content-type@1.0.5
├── cookie@1.0.2
├── cookie-signature@1.2.2
├── debug@4.4.0
├── encodeurl@2.0.0
├── escape-html@1.0.3
├── etag@1.8.1
├── finalhandler@2.1.0
├── fresh@2.0.0
├── merge-descriptors@2.0.0
├── mime-types@3.0.0
├── on-finished@2.4.1
├── once@1.4.0
├── parseurl@1.3.3
├── qs@6.14.0
├── range-parser@1.2.1
├── raw-body@3.0.0
├── router@2.1.0
├── send@1.1.0
├── serve-static@2.1.0
├── statuses@2.0.1
├── type-is@2.0.0
└── vary@1.1.2

helmet@8.1.0
└── (no dependencies)

cors@2.8.5
├── object-assign@4.1.1
└── vary@1.1.2

express-rate-limit@8.2.1
└── (no dependencies)

express-validator@7.3.1
├── lodash@4.17.21
└── validator@13.15.0
```

**Dependency Categories:**

| Category | Packages | Notes |
|----------|----------|-------|
| Direct (Production) | 5 | Express, Helmet, CORS, Rate-limit, Validator |
| Transitive | ~30 | Brought in by Express primarily |
| Dev Dependencies | 0 | None added in this implementation |
| Peer Dependencies | 0 | None required |

### 0.7.3 Import and Reference Updates

**Source Files Requiring Import Updates:**

| File | Import Changes |
|------|----------------|
| server.js | Add: express, helmet, cors, express-rate-limit, https, fs, path |
| src/middleware/security.js | Add: helmet |
| src/middleware/validation.js | Add: { body, validationResult } from express-validator |
| src/config/security.js | Add: dotenv (optional), path, fs |

**Import Transformation Examples:**

```javascript
// server.js - BEFORE
const http = require('http');

// server.js - AFTER
const https = require('https');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
```

```javascript
// src/middleware/validation.js - NEW FILE
const { body, validationResult } = require('express-validator');
```

### 0.7.4 Package Configuration Requirements

**Express Configuration:**

```javascript
const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

**Helmet Configuration (Default + Customizations):**

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**CORS Configuration:**

```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));
```

**Rate Limiter Configuration:**

```javascript
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);
```

### 0.7.5 NPM Commands for Implementation

```bash
# Install all security dependencies
npm install express@^5.2.1 helmet@^8.1.0 cors@^2.8.5 \
  express-rate-limit@^8.2.1 express-validator@^7.3.1

#### Verify installation and check for vulnerabilities
npm audit

#### Generate lock file (automatically done by install)
npm install --package-lock-only
```

## 0.8 Impact Analysis and Testing Strategy

### 0.8.1 Security Testing Requirements

**Vulnerability Regression Tests:**

| Test Case | Description | Expected Outcome |
|-----------|-------------|------------------|
| Security Headers Present | Verify Helmet adds all default headers | Response contains CSP, HSTS, X-Content-Type-Options, etc. |
| CORS Policy Enforced | Test cross-origin requests | Rejected unless origin in whitelist |
| Rate Limiting Active | Send >100 requests in 15 minutes | 429 Too Many Requests response after limit |
| HTTPS Enforcement | Attempt HTTP connection | Connection refused or redirect to HTTPS |
| Input Validation | Send malformed JSON | 400 Bad Request with validation errors |

**Specific Attack Scenarios to Test:**

| Attack Vector | Test Method | Expected Defense |
|---------------|-------------|------------------|
| XSS Injection | Send `<script>` in request body | Helmet CSP blocks inline scripts |
| Clickjacking | Embed in iframe from different origin | X-Frame-Options: DENY blocks |
| MIME Sniffing | Send mismatched Content-Type | X-Content-Type-Options: nosniff |
| DoS | Rapid request flooding | Rate limiter returns 429 |
| SQL Injection | Special characters in input | Validator sanitizes input |

### 0.8.2 Security-Specific Test Cases to Add

**New Test Files:**

| Test File | Purpose | Coverage |
|-----------|---------|----------|
| tests/security/headers.test.js | Verify all security headers present | Helmet integration |
| tests/security/rate-limit.test.js | Test rate limiting behavior | express-rate-limit |
| tests/security/cors.test.js | Validate CORS policy | cors middleware |
| tests/security/validation.test.js | Input validation tests | express-validator |
| tests/security/https.test.js | TLS configuration tests | HTTPS server |

**Example Test Structure:**

```javascript
// tests/security/headers.test.js
describe('Security Headers', () => {
  it('should include Content-Security-Policy', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toBeDefined();
  });
  
  it('should include Strict-Transport-Security', async () => {
    const res = await request(app).get('/');
    expect(res.headers['strict-transport-security']).toContain('max-age=');
  });
});
```

### 0.8.3 Existing Tests to Verify

**Regression Test Suite:**

Since this is a minimal test fixture, there are no existing tests. After implementation:

1. **Functional Regression:** Verify "Hello, World!" response still works
2. **HTTP Status Codes:** Ensure 200 OK for valid requests
3. **Content-Type:** Verify `text/plain` response type preserved

### 0.8.4 Verification Methods

**Automated Security Scanning:**

| Tool | Command | Purpose |
|------|---------|---------|
| npm audit | `npm audit` | Check for vulnerable dependencies |
| Mozilla Observatory | Online scan | Security headers rating |
| SSL Labs | Online scan | TLS configuration grade |
| Snyk | `snyk test` | Deep dependency vulnerability scan |

**Expected Results:**

```bash
# npm audit - Expected output
found 0 vulnerabilities

#### Mozilla Observatory - Expected grade
Grade: A+ (with proper CSP and HSTS)

#### SSL Labs - Expected grade
Grade: A (with TLS 1.3 and secure cipher suites)
```

**Manual Verification Steps:**

1. **Check Security Headers:**
   ```bash
   curl -I https://localhost:3443/
   ```

2. **Test Rate Limiting:**
   ```bash
   for i in {1..105}; do curl -s https://localhost:3443/; done
   ```

3. **Verify CORS:**
   ```bash
   curl -H "Origin: https://malicious.com" https://localhost:3443/
   ```

4. **Test TLS:**
   ```bash
   openssl s_client -connect localhost:3443 -tls1_3
   ```

### 0.8.5 Impact Assessment

**Direct Security Improvements Achieved:**

| Improvement | Before | After |
|-------------|--------|-------|
| Security Headers | 1 (Content-Type only) | 15+ headers |
| Encryption | None (HTTP) | TLS 1.3/1.2 (HTTPS) |
| Rate Limiting | None | 100 req/15 min default |
| Input Validation | None | Full sanitization |
| CORS Policy | Unrestricted | Whitelist-based |

**Minimal Side Effects:**

- **No breaking changes to public APIs:** "Hello, World!" response preserved
- **Internal changes only:** New middleware stack, file structure reorganization
- **Port change:** HTTP 3000 → HTTPS 3443 (configurable)

**Potential Impacts to Address:**

| Impact | Mitigation |
|--------|------------|
| Certificate warnings in dev | Use self-signed cert with trust instructions in README |
| Rate limit false positives | Configurable via environment variables |
| CORS blocking legitimate origins | Document ALLOWED_ORIGINS configuration |
| Existing HTTP clients breaking | Provide migration guide in README |

### 0.8.6 Test Execution Commands

```bash
# Full security test suite
npm test -- --testPathPattern=security

#### Specific test files
npm test -- tests/security/headers.test.js
npm test -- tests/security/rate-limit.test.js

#### Integration test with actual server
npm run test:integration

#### Security audit
npm audit --audit-level=high
```

## 0.9 Scope Boundaries

### 0.9.1 Exhaustively In Scope

**Dependency Manifests:**

- `package.json` - Add all security dependencies with version pins
- `package-lock.json` - Regenerate with complete dependency tree

**Source Files with Security Updates:**

- `server.js` - Complete rewrite with Express + HTTPS + security middleware
- `src/**/*.js` - New middleware and configuration modules
- `src/middleware/security.js` - Helmet and security header configuration
- `src/middleware/validation.js` - Input validation middleware functions
- `src/config/security.js` - Centralized security configuration

**Configuration Files Requiring Security Updates:**

- `.env.example` - Template for security environment variables
- `certs/server.key` - TLS private key (generated)
- `certs/server.crt` - TLS certificate (generated)

**Infrastructure and Deployment:**

- Certificate generation scripts (documentation in README)
- HTTPS server configuration
- Environment-based security settings (development vs production)

**Security Test Files:**

- `tests/security/**/*.test.js` - New security test suite
- `tests/security/headers.test.js` - Security headers verification
- `tests/security/rate-limit.test.js` - Rate limiting tests
- `tests/security/cors.test.js` - CORS policy validation
- `tests/security/validation.test.js` - Input validation tests

**Documentation Updates:**

- `README.md` - Add security configuration section
- Security setup instructions
- Environment variable documentation
- Certificate generation guide

### 0.9.2 Explicitly Out of Scope

**Feature Additions Unrelated to Security:**

- New API endpoints beyond "Hello, World!"
- Database integration
- Authentication/authorization systems (beyond header security)
- User session management
- Logging infrastructure (beyond error handling)

**Performance Optimizations Not Required for Security:**

- Response caching
- Load balancing configuration
- Database query optimization
- Static asset compression

**Code Refactoring Beyond Security Fix Requirements:**

- TypeScript migration
- Code style/formatting changes
- Test framework setup (beyond security tests)
- Build tooling (webpack, bundlers)

**Non-Vulnerable Dependencies:**

- No dependencies exist currently; all additions are security-focused

**Style or Formatting Changes:**

- ESLint/Prettier configuration
- Code comments unrelated to security
- Variable naming conventions

**Test Files Unrelated to Security Validation:**

- Unit tests for business logic (none exists)
- Integration tests beyond security verification
- End-to-end testing framework

**All Items Explicitly Excluded by User Instructions:**

- Changes to `LoginTest.java` (intentional placeholder)
- Changes to CSV data files (`products.csv`, `transactions.csv`)
- CI/CD pipeline creation (not requested)
- Docker containerization (not requested)

### 0.9.3 Scope Boundary Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        IN SCOPE                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ package.json          - Add security dependencies         │
│ ✓ package-lock.json     - Dependency lock file              │
│ ✓ server.js             - Express + HTTPS implementation    │
│ ✓ src/middleware/*      - Security middleware modules       │
│ ✓ src/config/*          - Security configuration            │
│ ✓ certs/*               - TLS certificates                  │
│ ✓ .env.example          - Environment template              │
│ ✓ README.md             - Security documentation            │
│ ✓ tests/security/*      - Security test suite               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       OUT OF SCOPE                          │
├─────────────────────────────────────────────────────────────┤
│ ✗ LoginTest.java        - Intentional placeholder           │
│ ✗ products.csv          - Test data file                    │
│ ✗ transactions.csv      - Test data file                    │
│ ✗ New features          - Beyond security hardening         │
│ ✗ CI/CD pipelines       - Not requested                     │
│ ✗ Docker/containers     - Not requested                     │
│ ✗ Database integration  - Not in security scope             │
│ ✗ TypeScript migration  - Refactoring out of scope          │
└─────────────────────────────────────────────────────────────┘
```

### 0.9.4 File Pattern Summary

**Files to Modify (Glob Patterns):**

```
package.json
package-lock.json
server.js
README.md
```

**Files to Create (Glob Patterns):**

```
certs/*.key
certs/*.crt
.env.example
src/middleware/*.js
src/config/*.js
tests/security/*.test.js
```

**Files to Ignore (Never Modify):**

```
*.java
*.csv
```

## 0.10 Special Instructions

### 0.10.1 Execution Parameters

**Security Verification Commands:**

| Purpose | Command | Expected Output |
|---------|---------|-----------------|
| Dependency vulnerability scan | `npm audit` | 0 vulnerabilities |
| Security test execution | `npm test -- --testPathPattern=security` | All tests passing |
| Full test suite validation | `npm test` | All tests passing |
| Security header check | `curl -I https://localhost:3443/` | All Helmet headers present |

**TLS Certificate Generation Commands:**

```bash
# Create certs directory
mkdir -p certs

#### Generate private key (2048-bit RSA)
openssl genrsa -out certs/server.key 2048

#### Generate self-signed certificate (valid 365 days)
openssl req -new -x509 -key certs/server.key \
  -out certs/server.crt -days 365 \
  -subj "/CN=localhost/O=Development/C=US"
```

**Server Start Commands:**

```bash
# Development mode (with self-signed cert warnings)
NODE_ENV=development npm start

#### Production mode (requires valid certificates)
NODE_ENV=production npm start
```

### 0.10.2 Research Documentation

**Security Advisories Consulted:**

| Source | Reference | Key Finding |
|--------|-----------|-------------|
| npm registry | helmet@8.1.0 | 0 dependencies, sets 15+ headers |
| npm registry | express@5.2.1 | Promise support, ReDoS mitigation |
| npm registry | express-rate-limit@8.2.1 | draft-8 headers, 10M+ downloads |
| Node.js TLS docs | v25.2.1 documentation | TLS 1.3 preferred, secure defaults |
| OWASP | Security Headers Project | CSP, HSTS, X-Frame-Options required |

**Security Best Practices Applied:**

| Practice | Source | Implementation |
|----------|--------|----------------|
| Use Helmet.js | OWASP | `app.use(helmet())` |
| Rate limiting | Express Rate Limit docs | 100 req/15 min window |
| TLS 1.3 preferred | Node.js security | Default cipher suites |
| Input validation | express-validator | Validation chains |
| Least privilege headers | Helmet defaults | Remove X-Powered-By |

### 0.10.3 Implementation Constraints

**Priority:** Security fix first, minimal disruption second

**Backward Compatibility:**

- MUST maintain: "Hello, World!" response functionality
- MUST maintain: JSON response capability
- MAY change: Port number (HTTP 3000 → HTTPS 3443)
- MAY change: Binding address (configurable via environment)

**Deployment Considerations:**

| Consideration | Resolution |
|---------------|------------|
| Self-signed certificates | Document trust instructions in README |
| Environment variables | Provide .env.example template |
| HTTPS-only access | Provide HTTP redirect option |
| Rate limit tuning | Make configurable via environment |

### 0.10.4 Security-Specific Requirements Emphasized by User

**Explicit User Directives:**

- ✓ "Implement security headers" → Helmet.js integration
- ✓ "Input validation" → express-validator middleware
- ✓ "Rate limiting" → express-rate-limit middleware
- ✓ "HTTPS support" → Node.js https module with TLS certificates
- ✓ "Update dependencies" → Add Express.js and security packages
- ✓ "Add helmet.js for security middleware" → Helmet v8.1.0
- ✓ "Configure proper CORS policies" → cors middleware with whitelist

**Implementation Notes:**

- **Change Scope:** Comprehensive security hardening as requested
- **Secrets Management:** TLS certificates stored in `certs/` directory, gitignored for security
- **Compliance:** Implementation follows OWASP guidelines for Node.js security
- **Breaking Changes:** None for existing "Hello, World!" functionality; HTTP clients will need to upgrade to HTTPS

### 0.10.5 Environment Configuration Reference

**.env.example Template:**

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HTTPS_PORT=3443

#### Security Configuration
ALLOWED_ORIGINS=https://localhost:3443,https://example.com

#### Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

#### TLS Configuration (paths relative to project root)
TLS_KEY_PATH=./certs/server.key
TLS_CERT_PATH=./certs/server.crt
```

### 0.10.6 Post-Implementation Checklist

**Security Validation Checklist:**

- [ ] All Helmet headers present in response
- [ ] HTTPS server accessible on configured port
- [ ] Rate limiting returns 429 after limit exceeded
- [ ] CORS blocks unauthorized origins
- [ ] Input validation rejects malformed requests
- [ ] npm audit shows 0 vulnerabilities
- [ ] TLS 1.3 negotiation successful
- [ ] "Hello, World!" response still works

**Documentation Checklist:**

- [ ] README updated with security section
- [ ] .env.example contains all variables
- [ ] Certificate generation documented
- [ ] Migration guide for HTTP → HTTPS provided

