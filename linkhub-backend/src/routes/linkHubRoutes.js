import express from "express";

import { requireAdmin } from "../middleware/auth.js";
import LinkHub from "../models/LinkHub.js";


import {
  createHub,
  getHub,
  trackClick,
  addLink,
  updateLink,
  deleteLink,
  reorderLinks,
  getAnalytics,
  updateHubProfile
} from "../controllers/linkHubController.js";

const router = express.Router(); // ✅ THIS WAS MISSING

// ============================
// GET HUB FOR LOGGED-IN USER
// ============================
router.get("/hub/my-hub", requireAdmin, async (req, res) => {
  try {
    console.log("DEBUG USER ID:", req.userId);

    const hubs = await LinkHub.find({});
    console.log("DEBUG ALL HUBS:", hubs);

    let hub = await LinkHub.findOne({ userId: req.userId });
    console.log("DEBUG FOUND HUB:", hub);

    // 🛟 SAFETY NET: auto-create hub if missing
    if (!hub) {
      hub = await LinkHub.create({
        userId: req.userId,
        title: "My Link Hub",
        description: "My smart link hub",
        slug: `user-${req.userId.toString().slice(-6)}`,
        theme: "dark",
        links: []
      });

      console.log("DEBUG AUTO-CREATED HUB:", hub);
    }

    res.json(hub);
  } catch (err) {
    console.error("My hub error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================
// GEO LOCATION (BACKEND - RELIABLE + FALLBACK)
// ============================
router.get("/geo", async (req, res) => {
  try {
    let ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "";

    console.log("🌍 GEO IP:", ip);

    // Handle localhost / private IPs
    if (
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.")
    ) {
      console.log("🌍 GEO FALLBACK: Localhost detected");

      return res.json({
        country: "India ",
        region: "Local Dev"
      });
    }

    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await geoRes.json();

    console.log("🌍 GEO DATA:", data);

    res.json({
      country: data.country || "Unknown",
      region: data.regionName || "Unknown"
    });
  } catch (err) {
    console.error("Geo error:", err);
    res.json({ country: "Unknown", region: "Unknown" });
  }
});



// =========================
// PUBLIC
// =========================
router.get("/hub/:slug", getHub);
router.post("/hub/click/:hubId/:linkId", trackClick);
router.get("/hub/:slug/analytics", getAnalytics);

// =========================
// ADMIN / MANAGEMENT
// =========================

// Create hub manually (optional/admin)
router.post("/hub", createHub);

// Add link
router.post("/hub/:hubId/links", addLink);

// Single link operations
router.put("/hub/:hubId/link/:linkId", updateLink);
router.delete("/hub/:hubId/link/:linkId", deleteLink);

// Reorder
router.put("/hub/:hubId/reorder", reorderLinks);

// Hub profile
router.put("/hub/:hubId/profile", updateHubProfile);

export default router;

