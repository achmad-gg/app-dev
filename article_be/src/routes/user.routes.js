import express from 'express'
import { blockUser, activateUser } from '../controllers/user.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.patch('/:id/block', authMiddleware, blockUser)
router.patch('/:id/activate', authMiddleware, activateUser)

export default router
