import express from 'express'
import { getActivityLogs } from '../controllers/admin.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleMiddleware } from '../middlewares/role.middleware.js'
import {
    getDashboardStats,
    getAllUsers,
    toggleUserStatus,
    changeUserRole,
    getPendingArticles
} from '../controllers/admin.controller.js'

const router = express.Router()
router.use(authMiddleware, roleMiddleware(['admin']))

router.get('/stats', getDashboardStats)
router.get('/users', getAllUsers)
router.get('/articles/pending', getPendingArticles)
router.patch('/users/:id/status', toggleUserStatus)
router.patch('/users/:id/role', changeUserRole)

router.get(
  '/activity-logs',
  authMiddleware,
  roleMiddleware(['admin']),
  getActivityLogs
)

export default router
