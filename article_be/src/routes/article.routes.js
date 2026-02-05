import express from "express";
import * as controller from "../controllers/article.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

/* =======================
   PUBLIC
======================= */
router.get("/", controller.findAllApproved);

// ✅ Public detail (approved-only)
router.get("/public/:id", controller.findApprovedById);

/* =======================
   USER (AUTH)
======================= */
router.post("/create", authMiddleware, controller.create);
router.get("/my", authMiddleware, controller.findMyArticles);

// ✅ Auth detail: owner/admin/mod bisa lihat pending/rejected
router.get("/:id", authMiddleware, controller.findByIdAuth);

/* =======================
   ADMIN / MODERATOR
======================= */
router.get(
  "/admin/list",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
  controller.findAllAdmin,
);

router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
  controller.approve,
);

router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
  controller.reject,
);

/* =======================
   UPDATE & DELETE
======================= */
router.put("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.remove);

export default router;
