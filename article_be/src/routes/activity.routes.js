import express from 'express'
import * as controller from '../controllers/activity.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleMiddleware } from '../middlewares/role.middleware.js'

const router = express.Router()

/**
 * GET /api/activity
 * Admin / Moderator only
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'moderator']),
  controller.findAll
)

export default router
