import LinkHub from "../models/LinkHub.js";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

// ❌ REMOVE backend rule engine
// import { applyRules } from "../utils/ruleEngine.js";

/* CREATE A NEW LINK HUB */
export const createHub = async (req, res) => {
  try {
    const hub = await LinkHub.create(req.body);
    res.status(201).json(hub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const hub = await LinkHub.findOne({ slug: req.params.slug });
    if (!hub) return res.status(404).json({ message: "Hub not found" });

    const sorted = [...hub.links].sort((a, b) => b.clicks - a.clicks);

    res.json({
      title: hub.title,
      visits: hub.visits,
      links: hub.links,
      topLinks: sorted.slice(0, 5),
      bottomLinks: sorted.slice(-5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHub = async (req, res) => {
  try {
    const { slug } = req.params;

    const hub = await LinkHub.findOne({ slug });
    if (!hub) {
      return res.status(404).json({ message: "Hub not found" });
    }

    // Increment visits safely
    hub.visits = (hub.visits || 0) + 1;
    await hub.save();

    // 🚫 NO rule engine
    // 🚫 NO context logic
    // 🚫 NO applyRules

    return res.json({
      ...hub.toObject(),
      links: hub.links
    });
  } catch (err) {
    console.error("GET HUB FATAL ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch hub" });
  }
};


export const trackClick = async (req, res) => {
  try {
    const { hubId, linkId } = req.params;

    const hub = await LinkHub.findById(hubId);
    if (!hub) return res.status(404).json({ message: "Hub not found" });

    const link = hub.links.id(linkId);
    if (!link) return res.status(404).json({ message: "Link not found" });

    link.clicks += 1;
    await hub.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================================
   LINK MANAGEMENT (ADMIN APIs)
   ================================ */

export const addLink = async (req, res) => {
  try {
    const { hubId } = req.params;
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    // ✅ URL VALIDATION
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const hub = await LinkHub.findById(hubId);
    if (!hub) return res.status(404).json({ message: "Hub not found" });

    hub.links.push({ title, url });
    await hub.save();

    res.status(201).json(hub.links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLink = async (req, res) => {
  try {
    const { hubId, linkId } = req.params;
    const { title, url, priorityStart, priorityEnd, isLive } = req.body;

    const hub = await LinkHub.findById(hubId);
    if (!hub) return res.status(404).json({ message: "Hub not found" });

    const link = hub.links.id(linkId);
    if (!link) return res.status(404).json({ message: "Link not found" });

    if (title !== undefined) link.title = title;
    if (url !== undefined) link.url = url;
    if (priorityStart !== undefined) link.priorityStart = priorityStart;
    if (priorityEnd !== undefined) link.priorityEnd = priorityEnd;
    if (isLive !== undefined) link.isLive = isLive;

    await hub.save();

    res.json({ message: "Link updated", link });
  } catch (err) {
    console.error("UPDATE LINK ERROR:", err);
    res.status(500).json({ message: "Failed to update link" });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const { hubId, linkId } = req.params;

    const hub = await LinkHub.findById(hubId);
    if (!hub) return res.status(404).json({ message: "Hub not found" });

    const link = hub.links.id(linkId);
    if (!link) return res.status(404).json({ message: "Link not found" });

    link.deleteOne();
    await hub.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reorderLinks = async (req, res) => {
  try {
    const { orderedLinkIds } = req.body;

    if (!Array.isArray(orderedLinkIds)) {
      return res.status(400).json({ message: "orderedLinkIds required" });
    }

    const hub = await LinkHub.findById(req.params.hubId);
    if (!hub) return res.status(404).json({ message: "Hub not found" });

    const idToLinkMap = {};
    hub.links.forEach(link => {
      idToLinkMap[link._id.toString()] = link;
    });

    const newLinks = [];
    orderedLinkIds.forEach(id => {
      if (idToLinkMap[id]) newLinks.push(idToLinkMap[id]);
    });

    hub.links.forEach(link => {
      if (!orderedLinkIds.includes(link._id.toString())) {
        newLinks.push(link);
      }
    });

    hub.links = newLinks;
    await hub.save();

    res.json({ message: "Links reordered successfully", links: hub.links });
  } catch (err) {
    console.error("REORDER ERROR:", err);
    res.status(500).json({ message: "Reorder failed" });
  }
};

export const updateHubProfile = async (req, res) => {
  try {
    const { title, description } = req.body;

    const hub = await LinkHub.findById(req.params.hubId);
    if (!hub) return res.status(404).json({ message: "Hub not found" });

    hub.title = title;
    hub.description = description;
    await hub.save();

    res.json({ message: "Profile updated", hub });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

