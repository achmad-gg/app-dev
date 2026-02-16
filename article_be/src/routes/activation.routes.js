import { Router } from "express";
import {
  requestActivation,
  approveActivation,
} from "../controllers/activation.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// banned user request activation
router.post("/request", authMiddleware, requestActivation);

// admin approve
router.patch(
  "/approve/:requestId",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
  approveActivation,
);

export default router;
