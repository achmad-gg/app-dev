import multer from "multer"
import path from "path"
import fs from "fs"

const uploadDir = "uploads/articles"
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `article-${Date.now()}${ext}`)
  },
})

export const uploadArticleImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"))
    }
    cb(null, true)
  },
})
