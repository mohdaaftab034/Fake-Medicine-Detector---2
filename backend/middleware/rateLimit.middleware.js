import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  }
})

export const scanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each user to 20 scans per hour
  message: {
    success: false,
    message: 'Scan limit reached. Please try again after an hour'
  },
  keyGenerator: (req) => {
    return req.user ? req.user.id : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
  }
})
