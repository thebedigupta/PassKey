const express = require("express");
const User = require("../models/User");
const Password = require("../models/Password");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-masterPassword");
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change master password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.masterPassword = newPassword;
    await user.save();

    res.json({ message: "Master password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user account
router.delete("/account", auth, async (req, res) => {
  try {
    const { masterPassword } = req.body;

    if (!masterPassword) {
      return res
        .status(400)
        .json({ message: "Master password is required to delete account" });
    }

    const user = await User.findById(req.user._id);

    // Verify password
    const isMatch = await user.comparePassword(masterPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid master password" });
    }

    // Delete all user's passwords
    await Password.deleteMany({ userId: req.user._id });

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Export user data
router.get("/export", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-masterPassword");
    const passwords = await Password.find({ userId: req.user._id });

    // Decrypt passwords for export
    const decryptedPasswords = passwords.map((pwd) => ({
      name: pwd.name,
      website: pwd.website,
      username: pwd.username,
      password: pwd.decryptPassword(),
      category: pwd.category,
      notes: pwd.notes,
      createdAt: pwd.createdAt,
      updatedAt: pwd.updatedAt,
    }));

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      passwords: decryptedPasswords,
      exportedAt: new Date(),
    };

    res.json(exportData);
  } catch (error) {
    console.error("Export data error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
