// controllers/notification.controller.js
import {
  getNotificationsByUser,
  markNotificationAsRead,
  clearAllNotificationsByUser,
  deleteNotificationById,
} from "../services/notification.service.js";

export async function getMyNotifications(req, res) {
  const userId = req.user.id;
  const data = await getNotificationsByUser(userId);
  res.json(data);
}

export async function readNotification(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await markNotificationAsRead(id, userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function clearNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    await clearAllNotificationsByUser(userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await deleteNotificationById(id, userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
