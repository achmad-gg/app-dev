import express from "express";
import * as controller from "../controllers/article.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = express.Router();

/* =======================
   PUBLIC
======================= */
router.get("/", controller.findAllApproved);

/* =======================
   USER (AUTH)
======================= */
router.post("/create", authMiddleware, controller.create);
router.get("/my", authMiddleware, controller.findMyArticles);
router.get("/:id", authMiddleware, controller.update);

/* =======================
   ADMIN / MODERATOR
======================= */
router.get(
  "/admin/list",
  authMiddleware,
  roleMiddleware(["admin", "moderator"]),
  controller.findAllAdmin,
);

/* =======================
   DYNAMIC (PALING BAWAH)
======================= */
router.get("/:id", controller.findApprovedById);
router.put("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.remove);
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

export default router;
