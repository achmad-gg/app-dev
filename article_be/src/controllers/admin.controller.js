import * as ActivityService from "../services/activity.service.js";
import * as AdminService from "../services/admin.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await AdminService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id
    const users = await AdminService.getUsers(currentUserId)
    res.json(users)
  } catch (err) {
    next(err)
  }
}


export const getPendingArticles = async (req, res, next) => {
  try {
    const articles = await AdminService.getPendingArticles();
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await AdminService.updateUserStatus(
      req.params.id,
      req.body.is_active,
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User status updated",
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const user = await AdminService.updateUserRole(
      req.params.id,
      req.body.role_id,
    );

    res.json({
      message: "User role updated",
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await ActivityService.getLogs({ page, limit });

    res.json({
      page,
      limit,
      total: result.total,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};
