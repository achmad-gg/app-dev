import {
  blockUserService,
  activateUserService,
} from "../services/user.service.js";

export const blockUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const adminId = req.user.id;

    const result = await blockUserService(id, adminId);

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
