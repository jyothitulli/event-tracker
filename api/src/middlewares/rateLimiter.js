/**
 * IP-based Rate Limiting Middleware
 * Strictly limits to 50 requests per 60 seconds per IP
 */

const rateLimit = require('express-rate-limit');

// In-memory store for more precise control
const store = new Map();

// Custom key generator
const keyGenerator = (req) => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
};

// Strict rate limiter with exact 50 count
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute (60000 ms)
  max: 50, // EXACTLY 50 requests per IP
  message: {
    error: 'Too many requests, please try again later.',
    limit: 50,
    windowMs: 60000,
    retryAfter: 60
  },
  statusCode: 429,
  headers: true,
  skipFailedRequests: false, // Count failed requests
  skipSuccessfulRequests: false, // Count successful requests
  keyGenerator,
  
  // Handle rate limit exceeded
  handler: (req, res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    
    res.setHeader('Retry-After', retryAfter);
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', 0);
    
    res.status(options.statusCode).json({
      error: 'Rate limit exceeded. Maximum 50 requests per minute.',
      retryAfter: retryAfter,
      limit: options.max,
      windowMs: options.windowMs
    });
  },
  
  // Skip health checks
  skip: (req) => req.path === '/health',
  
  // Use custom store for better control
  store: {
    async increment(key) {
      const now = Date.now();
      const windowMs = 60 * 1000;
      
      if (!store.has(key)) {
        store.set(key, []);
      }
      
      const requests = store.get(key);
      
      // Clean old requests
      const validRequests = requests.filter(time => now - time < windowMs);
      validRequests.push(now);
      
      store.set(key, validRequests);
      
      return {
        totalHits: validRequests.length,
        resetTime: new Date(now + windowMs)
      };
    },
    
    async decrement(key) {
      // Optional: implement if needed
    },
    
    async resetKey(key) {
      store.delete(key);
    }
  }
});

// Simplified version for testing
const testLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Too many requests',
  statusCode: 429,
  headers: true
});

module.exports = {
  rateLimiter,
  testLimiter
};