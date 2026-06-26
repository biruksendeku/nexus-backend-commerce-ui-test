

// import packages
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');


// ------------------------------------------------------------------
// Base configuration factory
// ------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production';

const createLimiter = (overrides = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests. Please try again later.',
    statusCode = 429,
    skip = () => false,
    keyGenerator = defaultKeyGenerator,
    handler = defaultHandler,
    ...rest
  } = overrides;

  return rateLimit({
    windowMs,
    max,
    message,
    statusCode,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    keyGenerator,
    handler,
    ...rest,
  });
};


// ------------------------------------------------------------------
// shared helpers
// ------------------------------------------------------------------
const defaultKeyGenerator = (req) => {
  // identify by authenticated user ID, otherwise IP
  return req.user?.id || ipKeyGenerator(req.ip);
};


const defaultHandler = (req, res, next, options) => {
  if (isProduction) {
    console.warn(`Rate limit exceeded for ${req.ip} on ${req.originalUrl}`);
  }

  res.status(options.statusCode).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: options.message,
      retryAfter: Math.ceil(options.windowMs / 1000),
    },
  });
};

// skip health checks globally
const skipHealth = (req) => req.path === '/health';


// ------------------------------------------------------------------
// all limiters
// ------------------------------------------------------------------

// API limiter – moderate protection
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 60 : 100,
  message: 'Too many API requests. Please try again later.',
  skip: skipHealth,
});

// Auth limiter – strictest, no skip
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 25 : 50,
  message: 'Too many authentication attempts. Please try again later.',
});

// Public limiter – generous
const publicLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: isProduction ? 100 : 500,
  message: 'Too many requests. Please slow down.',
  skip: skipHealth,
});


// export them
module.exports = {
	apiLimiter,
	authLimiter,
	publicLimiter
};
