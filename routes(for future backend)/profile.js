import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();


router.get("/:userId", authenticate, async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM profiles WHERE user_id=$1", [userId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:userId", authenticate, async (req, res) => {
  const { userId } = req.params;
  const { name, bio, riding_level, favorite_tricks } = req.body;

  if (parseInt(userId) !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  try {
    const result = await pool.query(
      `UPDATE profiles SET name=$1, bio=$2, riding_level=$3, favorite_tricks=$4
       WHERE user_id=$5 RETURNING *`,
      [name, bio, riding_level, favorite_tricks, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
