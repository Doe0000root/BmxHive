import express from "express";
import { openDB } from "../db.js";
import { authenticate, blockBanned } from "../middleware/auth.js";

const router = express.Router();


router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const trickId = Number(req.params.id);
    const userId = Number(req.user.id);
    const db = await openDB();

    const trick = await db.get(
      `SELECT id, user_id, COALESCE(likes, 0) AS likes FROM tricks WHERE id = ?`,
      [trickId]
    );

    if (!trick) {
      return res.status(404).json({ error: "Trick not found" });
    }

    const existing = await db.get(
      `SELECT id FROM trick_likes WHERE trick_id = ? AND user_id = ?`,
      [trickId, userId]
    );

    if (!existing && trick.user_id === userId) {
      return res.status(400).json({ error: "You cannot like your own post" });
    }

    if (existing) {
      await db.run(
        `DELETE FROM trick_likes WHERE trick_id = ? AND user_id = ?`,
        [trickId, userId]
      );

      await db.run(
        `UPDATE tricks SET likes = MAX(likes - 1, 0) WHERE id = ?`,
        [trickId]
      );

      await db.run(
        `UPDATE profiles SET points = MAX(points - 1, 0) WHERE user_id = ?`,
        [trick.user_id]
      );
    } else {
      await db.run(
        `INSERT INTO trick_likes (trick_id, user_id) VALUES (?, ?)`,
        [trickId, userId]
      );

      await db.run(
        `UPDATE tricks SET likes = likes + 1 WHERE id = ?`,
        [trickId]
      );

      await db.run(
        `UPDATE profiles SET points = points + 1 WHERE user_id = ?`,
        [trick.user_id]
      );
    }

    const updated = await db.get(
      `
      SELECT
        t.*,
        COALESCE(t.likes, 0) AS likes,
        COALESCE(NULLIF(p.name, ''), NULLIF(u.name, ''), 'Anonymous') AS author_name,
        COALESCE(
          NULLIF(p.avatar_url, ''),
          NULLIF(u.avatar_url, ''),
          'https://i.etsystatic.com/21799038/r/il/3e4e5d/2722919832/il_fullxfull.2722919832_1rth.jpg'
        ) AS author_avatar,
        (
          SELECT json_group_array(user_id)
          FROM trick_likes tl
          WHERE tl.trick_id = t.id
        ) AS liked_by
      FROM tricks t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE t.id = ?
      `,
      [trickId]
    );

    updated.hashtags = updated.hashtags ? JSON.parse(updated.hashtags) : [];
    updated.liked_by = updated.liked_by ? JSON.parse(updated.liked_by) : [];

    res.json(updated);
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { level } = req.query;
    const db = await openDB();

    let query = `
      SELECT
        t.*,
        COALESCE(NULLIF(p.name, ''), NULLIF(u.name, ''), 'Anonymous') AS author_name,
        COALESCE(
          NULLIF(p.avatar_url, ''),
          NULLIF(u.avatar_url, ''),
          'https://i.etsystatic.com/21799038/r/il/3e4e5d/2722919832/il_fullxfull.2722919832_1rth.jpg'
        ) AS author_avatar,
        COALESCE(p.points, u.points, 0) AS author_points
      FROM tricks t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN profiles p ON p.user_id = u.id
    `;

    const params = [];

    if (level) {
      query += ` WHERE t.level = ?`;
      params.push(level);
    }

    query += ` ORDER BY t.created_at DESC`;

    const tricks = await db.all(query, params);

    res.json(
      tricks.map(t => ({
        ...t,
        hashtags: t.hashtags ? JSON.parse(t.hashtags) : [],
      }))
    );
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
        COALESCE(NULLIF(p.name, ''), NULLIF(u.name, ''), 'Anonymous') AS author_name,
        COALESCE(
          NULLIF(p.avatar_url, ''),
          NULLIF(u.avatar_url, ''),
          'https://i.etsystatic.com/21799038/r/il/3e4e5d/2722919832/il_fullxfull.2722919832_1rth.jpg'
        ) AS author_avatar,
      COALESCE(p.points, u.points, 0) AS author_points
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
