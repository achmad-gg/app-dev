import { pool } from "../config/db.js";
import {
  getAllActivationRequestsService,
  approveActivationRequestService,
  rejectActivationRequestService,
} from "../services/activationRequest.service.js";

export const getAllActivationRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const requests = await getAllActivationRequestsService();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const requestActivation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const userResult = await pool.query(
      `SELECT status FROM users WHERE id = $1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.status !== "banned") {
      return res.status(403).json({
        message: "Only permanently banned users can request activation",
      });
    }

    const existing = await pool.query(
      `SELECT id FROM activation_requests
       WHERE user_id = $1 AND status = 'pending'`,
      [userId],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "You already have a pending activation request",
      });
    }

    await pool.query(
      `INSERT INTO activation_requests (user_id, reason)
       VALUES ($1, $2)`,
      [userId, reason],
    );

    res.json({ message: "Activation request submitted" });
  } catch (err) {
    next(err);
  }
};

export const approveActivationRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const result = await approveActivationRequestService(id);

    res.json({
      message: "Activation request approved and user activated",
      request: result.request,
      user: result.user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const rejectActivationRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const result = await rejectActivationRequestService(id);

    res.json({
      message: "Activation request rejected",
      request: result.request,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
