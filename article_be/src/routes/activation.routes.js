import { Router } from "express";
import {
  requestActivation,
  getAllActivationRequests,
  approveActivationRequest,
  rejectActivationRequest,
} from "../controllers/activation.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// banned user request activation
router.post("/request", authMiddleware, requestActivation);

// admin approve
router.patch(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
    approveActivationRequest,
);

// admin reject
router.patch(
  "/reject/:id",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
    rejectActivationRequest,
);

// admin get all activation requests
router.get(
  "/activation-requests",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
    getAllActivationRequests,
);

export default router;
