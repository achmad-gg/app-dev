// src/routes/comment.routes.js
import express from 'express'
import * as controller from '../controllers/comment.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleMiddleware } from '../middlewares/role.middleware.js'
import { commentLimiter } from '../middlewares/rateLimit.middleware.js'


const router = express.Router()

router.get('/article/:articleId', controller.findByArticle)
router.post('/article/:articleId', authMiddleware, commentLimiter, controller.create)
router.delete('/:id', authMiddleware, controller.remove)

router.patch(
  '/:id/approve',   
  authMiddleware,
  roleMiddleware(['admin', 'moderator']),
  controller.approve
)

export default router
