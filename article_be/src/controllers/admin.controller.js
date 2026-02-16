import * as ActivityService from "../services/activity.service.js";
import * as AdminService from "../services/admin.service.js";

const parsePagination = (req, defaults = { page: 1, limit: 10 }) => {
  const page = Number.parseInt(req.query.page, 10) || defaults.page;
  const limit = Number.parseInt(req.query.limit, 10) || defaults.limit;
  return { page, limit };
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await AdminService.getStats();
    return res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const users = await AdminService.getUsers(currentUserId);
    return res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getPendingArticles = async (req, res, next) => {
  try {
    const articles = await AdminService.getPendingArticles();
    return res.json(articles);
  } catch (err) {
    next(err);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await AdminService.updateUserStatus(
      req.params.id,
      req.body.is_active
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User status updated", user });
  } catch (err) {
    next(err);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const user = await AdminService.updateUserRole(
      req.params.id,
      req.body.role_id
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "User role updated", user });
  } catch (err) {
    next(err);
  }
};

export const getActivityLogs = async (req, res, next) => {
  try {
    const { page, limit } = parsePagination(req);
    const result = await ActivityService.getLogs({ page, limit });

    return res.json({
      page,
      limit,
      total: result.total,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};
