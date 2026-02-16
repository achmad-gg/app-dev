// routes/notification.routes.js
import express from "express";
import {
  getMyNotifications,
  readNotification,
  clearNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
router.patch("/:id/read", authMiddleware, readNotification);
router.delete("/", authMiddleware, clearNotifications);
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
