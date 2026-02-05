import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts' },
})

export const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: 'Slow down, too many comments' },
})
