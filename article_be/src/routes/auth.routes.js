// src/routes/auth.routes.js
import express from 'express'
import { register, login } from '../controllers/auth.controller.js'
import { authLimiter } from '../middlewares/rateLimit.middleware.js'

const router = express.Router()

router.post('/login', authLimiter, login)
router.post('/register', authLimiter, register)

export default router
