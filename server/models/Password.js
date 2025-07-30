const mongoose = require("mongoose");
const crypto = require("crypto");

const passwordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  encryptedPassword: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["login", "card", "note"],
    default: "login",
  },
  notes: {
    type: String,
    trim: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastUsed: {
    type: Date,
  },
});

// Update the updatedAt field before saving
passwordSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Encrypt password before saving
passwordSchema.methods.encryptPassword = function (password) {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || "your-32-character-encryption-key!!!",
    "salt",
    32
  );
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

// Decrypt password
passwordSchema.methods.decryptPassword = function () {
  const algorithm = "aes-256-cbc";
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY || "your-32-character-encryption-key!!!",
    "salt",
    32
  );

  const textParts = this.encryptedPassword.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = textParts.join(":");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// Don't return the actual encrypted password in JSON
passwordSchema.methods.toJSON = function () {
  const password = this.toObject();
  delete password.encryptedPassword;
  return password;
};

module.exports = mongoose.model("Password", passwordSchema);
