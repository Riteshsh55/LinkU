import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import LinkHub from "../models/LinkHub.js";
import { requireAdmin } from "../middleware/auth.js";


const router = express.Router();

/* =========================
   USER SIGNUP
   ========================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const slug = email.split("@")[0].toLowerCase();

    // CREATE USER
    const user = await User.create({
      name,
      email,
      passwordHash,
      slug
    });

    // ============================
    // AUTO-CREATE HUB FOR USER
    // ============================
    // ✅ AUTO CREATE HUB FOR USER
// AFTER user.save()
await LinkHub.create({
  userId: user._id,
  title: `${user.name}'s Link Hub`,
  description: "My smart link hub",
  slug: user.slug,
  theme: "dark",
  links: []
});


    res.status(201).json({
      message: "User created",
      slug: user.slug
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LOGIN (USER OR ADMIN)
   ========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    let account = null;
    let type = "user";

    if (username) {
      account = await Admin.findOne({ username });
      type = "admin";
    } else if (email) {
      account = await User.findOne({ email });
      type = "user";
    }

    if (!account) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, account.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: account._id, type },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, type });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CHANGE PASSWORD (USER)
   ========================= */
router.post("/change-password", requireAdmin, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Password update failed" });
  }
});

// ============================
// UPDATE PROFILE (NAME/EMAIL)
// ============================
// =======================
// UPDATE PROFILE
// =======================
router.put("/profile", requireAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;

    // Update slug if name changed
    if (name) {
      const newSlug = name.toLowerCase().replace(/\s+/g, "");
      user.slug = newSlug;

      // Update hub slug too
      await LinkHub.findOneAndUpdate(
        { userId: user._id },
        { slug: newSlug }
      );
    }

    await user.save();

    res.json({ message: "Profile updated", slug: user.slug });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});



export default router;

