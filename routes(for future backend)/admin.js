import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();


router.get("/", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Access denied" });
  try {
    const result = await pool.query("SELECT * FROM admin_content ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Access denied" });

  const { title, description, content, type } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO admin_content (title, description, content, type, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, content, type, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", authenticate, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Access denied" });

  const { id } = req.params;
  try {
    await pool.query("DELETE FROM admin_content WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
