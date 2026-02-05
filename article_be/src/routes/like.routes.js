// src/routes/like.routes.js
import express from 'express'
import * as controller from '../controllers/like.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/:articleId', authMiddleware, controller.like)
router.delete('/:articleId', authMiddleware, controller.unlike)
router.get('/:articleId/status', authMiddleware, controller.status)
router.get('/:articleId/count', controller.count)

export default router
