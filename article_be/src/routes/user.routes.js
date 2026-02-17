import express from "express";
import {
  blockUser,
  activateUser,
//   getAllActivationRequests,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.patch("/:id/block", authMiddleware, blockUser);
router.patch("/:id/activate", authMiddleware, activateUser);
// router.get("/activation-requests", authMiddleware, getAllActivationRequests);

export default router;
