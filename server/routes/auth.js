const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, masterPassword } = req.body;

    // Validation
    if (!name || !email || !masterPassword) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (masterPassword.length < 8) {
      return res.status(400).json({
        message: "Master password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      masterPassword,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET ||
        "your-super-secret-jwt-key-change-this-in-production",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, masterPassword } = req.body;

    // Validation
    if (!email || !masterPassword) {
      return res
        .status(400)
        .json({ message: "Please provide email and master password" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(masterPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET ||
        "your-super-secret-jwt-key-change-this-in-production",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Google OAuth login/register
router.post("/google", async (req, res) => {
  try {
    const { credential, email, name, googleId, picture } = req.body;

    let verifiedUser = null;

    // If we have a credential (ID token), verify it with Google
    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        verifiedUser = {
          email: payload.email,
          name: payload.name,
          googleId: payload.sub,
          picture: payload.picture,
        };
      } catch (verifyError) {
        console.error("Google token verification failed:", verifyError);
        return res.status(400).json({ message: "Invalid Google token" });
      }
    } else if (email && name && googleId) {
      // Fallback to client-provided data (less secure but functional)
      verifiedUser = { email, name, googleId, picture };
    } else {
      return res
        .status(400)
        .json({ message: "Missing required Google OAuth data" });
    }

    const {
      email: userEmail,
      name: userName,
      googleId: userGoogleId,
      picture: userPicture,
    } = verifiedUser;

    // Check if user already exists
    let user = await User.findOne({ email: userEmail });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = userGoogleId;
        user.picture = userPicture;
        await user.save();
      }
    } else {
      // Create new user with Google OAuth
      user = new User({
        name: userName,
        email: userEmail,
        googleId: userGoogleId,
        picture: userPicture,
        // For Google OAuth users, we'll set a random master password
        // They won't use this for login, only for encrypting their stored passwords
        masterPassword: require("crypto").randomBytes(32).toString("hex"),
      });

      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET ||
        "your-super-secret-jwt-key-change-this-in-production",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Google OAuth successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ message: "Server error during Google OAuth" });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify token
router.get("/verify", auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
