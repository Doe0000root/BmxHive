import express from "express";
import { openDB } from "../db.js";
import { authenticate } from "../middleware/auth.js";
import { blockBanned } from "../middleware/auth.js";
import fs from "fs";
import path from "path";

const router = express.Router();


router.get("/me", authenticate, async (req, res) => {
  try {
    const db = await openDB();

    const profile = await db.get(
      `
      SELECT p.*, u.email, u.role
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
      `,
      [req.user.id]
    );

    if (!profile) return res.status(404).json({ error: "Profile not found" });

   
    if (profile.trick_videos) {
      try {
        profile.trick_videos = JSON.parse(profile.trick_videos);
      } catch {
        profile.trick_videos = [];
      }
    } else {
      profile.trick_videos = [];
    }

    profile.banned = Boolean(profile.banned);

    res.json(profile);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/me", authenticate, blockBanned, async (req, res) => {
  try {
    const { name, bio, favorite_tricks } = req.body;
    const db = await openDB();

    await db.run(
      `
      UPDATE profiles
      SET name = ?, bio = ?, favorite_tricks = ?
      WHERE user_id = ?
      `,
      [name, bio, favorite_tricks, req.user.id]
    );

    const updated = await db.get(
      `
      SELECT p.*, u.email, u.role
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
      `,
      [req.user.id]
    );

    if (updated.trick_videos) {
      try {
        updated.trick_videos = JSON.parse(updated.trick_videos);
      } catch {
        updated.trick_videos = [];
      }
    } else {
      updated.trick_videos = [];
    }

    updated.banned = Boolean(updated.banned);

    res.json(updated);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/add-points", authenticate, blockBanned, async (req, res) => {
  try {
    const { points } = req.body;
    const db = await openDB();

    await db.run(
      `UPDATE profiles SET points = points + ? WHERE user_id = ?`,
      [points, req.user.id]
    );

    const updated = await db.get(
      `
      SELECT p.*, u.email, u.role
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
      `,
      [req.user.id]
    );

    if (updated.trick_videos) {
      try {
        updated.trick_videos = JSON.parse(updated.trick_videos);
      } catch {
        updated.trick_videos = [];
      }
    } else {
      updated.trick_videos = [];
    }

    updated.banned = Boolean(updated.banned);

    res.json(updated);
  } catch (err) {
    console.error("Add points error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/avatar", authenticate, blockBanned, async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ error: "No avatar uploaded" });
    }

    const avatar = req.files.avatar;
    const uploadDir = path.join("uploads", "avatars");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${req.user.id}_${Date.now()}_${avatar.name}`;
    const filePath = path.join(uploadDir, fileName);

    await avatar.mv(filePath);

    const db = await openDB();
    await db.run(
      `UPDATE profiles SET avatar_url = ? WHERE user_id = ?`,
      [`/${filePath.replace(/\\/g, "/")}`, req.user.id]
    );

    const updated = await db.get(
      `SELECT * FROM profiles WHERE user_id = ?`,
      [req.user.id]
    );

    updated.trick_videos = updated.trick_videos
      ? JSON.parse(updated.trick_videos)
      : [];
    updated.banned = Boolean(updated.banned);

    res.json(updated);
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/video", authenticate, blockBanned, async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: "No video uploaded" });
    }

    const video = req.files.video;
    const uploadDir = path.join("uploads", "videos");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${req.user.id}_${Date.now()}_${video.name}`;
    const filePath = path.join(uploadDir, fileName);

    await video.mv(filePath);

    const db = await openDB();
    const profile = await db.get(`SELECT trick_videos FROM profiles WHERE user_id = ?`, [req.user.id]);

    let videos = [];
    if (profile.trick_videos) {
      try {
        videos = JSON.parse(profile.trick_videos);
      } catch {}
    }

    videos.push(`/${filePath.replace(/\\/g, "/")}`);

    await db.run(
      `UPDATE profiles SET trick_videos = ? WHERE user_id = ?`,
      [JSON.stringify(videos), req.user.id]
    );

    const updated = await db.get(
      `SELECT * FROM profiles WHERE user_id = ?`,
      [req.user.id]
    );

    updated.trick_videos = videos;
    updated.banned = Boolean(updated.banned);

    res.json(updated);
  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;


