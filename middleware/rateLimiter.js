const setRateLimit = require('express-rate-limit');

const rateLimitMiddleware = setRateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'You have exceeded your 5 requests per minute. Please wait and try again.',
  headers: true,
})

module.exports = rateLimitMiddleware;