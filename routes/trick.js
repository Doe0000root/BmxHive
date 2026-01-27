import express from "express";
import { openDB } from "../db.js";
import { authenticate, blockBanned } from "../middleware/auth.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const { level } = req.query;
    const db = await openDB();

    let query = `
      SELECT
        t.*,
        p.name AS author_name,
        p.avatar_url AS author_avatar
      FROM tricks t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN profiles p ON p.user_id = u.id
    `;

    const params = [];
    if (level) {
      query += " WHERE t.level = ?";
      params.push(level);
    }

    query += " ORDER BY t.created_at DESC";

    const tricks = await db.all(query, params);

    const normalized = tricks.map(t => ({
      ...t,
      hashtags: t.hashtags ? JSON.parse(t.hashtags) : [],
    }));

    res.json(normalized);
  } catch (err) {
    console.error("Get tricks error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, blockBanned, async (req, res) => {
  try {
    const { title, description, video_url, level, hashtags } = req.body;
    const db = await openDB();

    const result = await db.run(
      `
      INSERT INTO tricks (user_id, title, description, video_url, level, hashtags)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        title,
        description,
        video_url,
        level,
        JSON.stringify(hashtags || []),
      ]
    );

    const newTrick = await db.get(
      `
      SELECT
        t.*,
        p.name AS author_name,
        p.avatar_url AS author_avatar
      FROM tricks t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE t.id = ?
      `,
      [result.lastID]
    );

    newTrick.hashtags = newTrick.hashtags
      ? JSON.parse(newTrick.hashtags)
      : [];

    res.json(newTrick);
  } catch (err) {
    console.error("Post trick error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
