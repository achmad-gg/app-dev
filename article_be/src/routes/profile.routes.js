// src/routes/profile.routes.js
import express from 'express'
import {
  getMe,
  updateMe,
  changePassword,
  deleteAvatar,
  uploadAvatar
} from '../controllers/profile.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { uploadAvatarMulter } from "../middlewares/upload.middleware.js"

const router = express.Router()

router.use(authMiddleware)

router.get('/me', getMe)
router.put('/me', updateMe)
router.post("/me/avatar", uploadAvatarMulter.single("avatar"), uploadAvatar)
router.delete("/me/avatar", deleteAvatar)
router.put('/me/password', changePassword)

export default router
