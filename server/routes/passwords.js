const express = require("express");
const Password = require("../models/Password");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all passwords for user
router.get("/", auth, async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { userId: req.user._id };

    // Filter by category if provided
    if (category && category !== "all") {
      query.category = category;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { website: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const passwords = await Password.find(query).sort({ updatedAt: -1 });

    res.json(passwords);
  } catch (error) {
    console.error("Get passwords error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single password
router.get("/:id", auth, async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!password) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Decrypt the password for copying
    const decryptedPassword = password.decryptPassword();

    res.json({
      ...password.toJSON(),
      password: decryptedPassword,
    });
  } catch (error) {
    console.error("Get password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new password
router.post("/", auth, async (req, res) => {
  try {
    const { name, website, username, password, category, notes } = req.body;

    // Validation
    if (!name || !password) {
      return res
        .status(400)
        .json({ message: "Name and password are required" });
    }

    const newPassword = new Password({
      userId: req.user._id,
      name,
      website,
      username,
      category: category || "login",
      notes,
    });

    // Encrypt the password
    newPassword.encryptedPassword = newPassword.encryptPassword(password);

    await newPassword.save();

    res.status(201).json({
      message: "Password saved successfully",
      password: newPassword,
    });
  } catch (error) {
    console.error("Create password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update password
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, website, username, password, category, notes, isFavorite } =
      req.body;

    const existingPassword = await Password.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existingPassword) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Update fields
    existingPassword.name = name || existingPassword.name;
    existingPassword.website = website || existingPassword.website;
    existingPassword.username = username || existingPassword.username;
    existingPassword.category = category || existingPassword.category;
    existingPassword.notes = notes || existingPassword.notes;
    existingPassword.isFavorite =
      isFavorite !== undefined ? isFavorite : existingPassword.isFavorite;

    // Update password if provided
    if (password) {
      existingPassword.encryptedPassword =
        existingPassword.encryptPassword(password);
    }

    await existingPassword.save();

    res.json({
      message: "Password updated successfully",
      password: existingPassword,
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete password
router.delete("/:id", auth, async (req, res) => {
  try {
    const password = await Password.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!password) {
      return res.status(404).json({ message: "Password not found" });
    }

    res.json({ message: "Password deleted successfully" });
  } catch (error) {
    console.error("Delete password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get decrypted password (for copy to clipboard)
router.get("/:id/decrypt", auth, async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!password) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Update last used
    password.lastUsed = new Date();
    await password.save();

    const decryptedPassword = password.decryptPassword();

    res.json({ password: decryptedPassword });
  } catch (error) {
    console.error("Decrypt password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get password statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const totalPasswords = await Password.countDocuments({
      userId: req.user._id,
    });
    const loginCount = await Password.countDocuments({
      userId: req.user._id,
      category: "login",
    });
    const cardCount = await Password.countDocuments({
      userId: req.user._id,
      category: "card",
    });
    const noteCount = await Password.countDocuments({
      userId: req.user._id,
      category: "note",
    });
    const favoriteCount = await Password.countDocuments({
      userId: req.user._id,
      isFavorite: true,
    });

    res.json({
      total: totalPasswords,
      categories: {
        login: loginCount,
        card: cardCount,
        note: noteCount,
      },
      favorites: favoriteCount,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
