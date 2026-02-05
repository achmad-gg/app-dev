// src/middlewares/upload.middleware.js
import multer from "multer"
import path from "path"
import fs from "fs"

const uploadDir = "uploads/avatars"
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar-${Date.now()}${ext}`)
  },
})

export const uploadAvatarMulter = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"))
    }
    cb(null, true)
  },
})
