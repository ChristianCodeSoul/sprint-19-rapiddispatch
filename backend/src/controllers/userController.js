const User = require("../models/User");
const Order = require("../models/Order");
const { buildProfileUpdates } = require("../utils/userUtils");
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("items.product");
    res.status(200).json({
      success: true,
      data: { user, orders },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const updates = buildProfileUpdates(req.body);
    if (
      updates.username &&
      updates.username !== user.username
    ) {
      const existingUsername = await User.findOne({
        username: updates.username,
        _id: { $ne: user._id },
      });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    if (
      updates.email &&
      updates.email !== user.email
    ) {
      const existingEmail = await User.findOne({
        email: updates.email,
        _id: { $ne: user._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }
    }

    Object.assign(user, updates);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};



module.exports = {
  getProfile,
  updateProfile,
};