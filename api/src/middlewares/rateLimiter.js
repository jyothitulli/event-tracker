/**
 * IP-based Rate Limiting Middleware
 * Limits: 50 requests per 60 seconds per IP
 */

const rateLimit = require('express-rate-limit');

// Create a store for rate limiting (in-memory)
const rateLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000, // 1 minute default
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 50, // 50 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
    rateLimit: {
      limit: process.env.RATE_LIMIT_MAX_REQUESTS || 50,
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000
    }
  },
  statusCode: 429,
  headers: true, // Send rate limit info in headers
  keyGenerator: (req) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res, next, options) => {
    // Calculate retry after time
    const retryAfter = Math.ceil(options.windowMs / 1000);
    
    res.setHeader('Retry-After', retryAfter);
    res.status(options.statusCode).json({
      error: 'Too many requests, please try again later.',
      retryAfter: retryAfter,
      limit: options.max,
      windowMs: options.windowMs
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Export both configured limiter and a function to create custom limiters
module.exports = {
  rateLimiter,
  createLimiter: (windowMs, max) => rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests, please try again later.'
    },
    statusCode: 429,
    headers: true,
    keyGenerator: (req) => req.ip || req.connection.remoteAddress
  })
};
