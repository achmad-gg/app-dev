import {
  blockUserService,
  activateUserService
} from "../services/user.service.js";

import { createNotification } from "../services/notification.service.js";

export const blockUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const adminId = req.user.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: "Admin must provide a valid reason (min 5 characters) to suspend/block a user" });
    }

    const result = await blockUserService(id, adminId);

    // Send notification
    await createNotification({
      user_id: result.id,
      type: "user_blocked",
      message: `Akun kamu telah diubah statusnya menjadi '${result.status}' oleh admin karena alasan: ${reason}`,
      meta: {
        status: result.status,
        reason,
        violation_count: result.violation_count,
        ban_expires_at: result.ban_expires_at || null,
      },
    });

    res.json({
      message: "User blocked successfully",
      user: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const result = await activateUserService(id);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User activated",
      user: result,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


