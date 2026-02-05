// src/routes/category.routes.js
import express from 'express'
import * as controller from '../controllers/category.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleMiddleware } from '../middlewares/role.middleware.js'

const router = express.Router()

// public
router.get('/', controller.findAll)

// admin only
router.post('/create', authMiddleware, roleMiddleware(['admin']), controller.create)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), controller.update)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), controller.remove)

export default router
