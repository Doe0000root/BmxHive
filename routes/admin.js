import express from "express";
import { openDB } from "../db.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();



router.get("/posts", authenticate, requireAdmin, async (req, res) => {
  try {
    const db = await openDB();

    const posts = await db.all(`
      SELECT
        t.id,
        t.title,
        t.description,
        t.video_url,
        t.level,
        t.created_at,
        u.id AS author_id,
        COALESCE(p.name, u.email) AS author_name
      FROM tricks t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN profiles p ON p.user_id = u.id
      ORDER BY t.created_at DESC
    `);

    res.json(posts);
  } catch (err) {
    console.error("Admin fetch posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.delete("/posts/:id", authenticate, requireAdmin, async (req, res) => {
  const postId = Number(req.params.id);

  try {
    const db = await openDB();

    const post = await db.get(
      `SELECT id FROM tricks WHERE id = ?`,
      [postId]
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await db.run(
      `DELETE FROM tricks WHERE id = ?`,
      [postId]
    );

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Admin delete post error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

router.get("/users", authenticate, requireAdmin, async (req, res) => {
  try {
    const db = await openDB();

    const users = await db.all(`
      SELECT
        u.id,
        u.email,
        u.role,
        u.banned,
        COALESCE(u.name, p.name) AS name,
        COALESCE(p.bio, u.bio) AS bio,
        COALESCE(p.points, u.points, 0) AS points,
        COALESCE(p.avatar_url, u.avatar_url) AS avatar_url
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      ORDER BY u.id DESC
    `);

    res.json(
      users.map(u => ({
        id: u.id,
        name: u.name || "Unnamed User",   
        email: u.email,                  
        role: u.role,
        points: u.points,
        avatar_url: u.avatar_url,
        banned: Boolean(u.banned),
        bio: u.bio || "",
      }))
    );
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/users/:id/ban", authenticate, requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  const { banned } = req.body;

  try {
   
    if (req.user.id === userId) {
      return res.status(400).json({
        message: "You cannot ban yourself",
      });
    }

    const db = await openDB();

    const user = await db.get(
      `SELECT id, email, banned FROM users WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bannedValue = banned ? 1 : 0;

    
    await db.run(
      `UPDATE users SET banned = ? WHERE id = ?`,
      [bannedValue, userId]
    );

    
    await db.run(
      `UPDATE profiles SET banned = ? WHERE user_id = ?`,
      [bannedValue, userId]
    );

    const updatedUser = await db.get(
      `SELECT id, email, role, banned FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      message: banned
        ? "User has been banned"
        : "User has been unbanned",
      user: {
        ...updatedUser,
        banned: Boolean(updatedUser.banned),
      },
    });
  } catch (err) {
    console.error("Ban user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/users/profile", authenticate, requireAdmin, async (req, res) => {
  try {
    const db = await openDB();
    const { name, bio, avatar } = req.body;
    const userId = req.user.id;

    const user = await db.get(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await db.run(
      `
      UPDATE users
      SET name = ?, bio = ?
      WHERE id = ?
      `,
      [name, bio, userId]
    );

    if (avatar) {
      await db.run(
        `
        UPDATE profiles
        SET avatar_url = ?
        WHERE user_id = ?
        `,
        [avatar, userId]
      );
    }

    const updated = await db.get(
      `
      SELECT id, name, email, role, points, bio, banned
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    res.json({
      message: "Profile updated",
      user: {
        ...updated,
        banned: Boolean(updated.banned),
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
