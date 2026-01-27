import express from "express";
import { openDB } from "../db.js";
import { authenticate, blockBanned } from "../middleware/auth.js";

const router = express.Router();



router.post("/", authenticate, blockBanned, async (req, res) => {
  try {
    const { trick_id, reason } = req.body;
    const db = await openDB();

    await db.run(
      `
      INSERT INTO tickets (trick_id, reporter_id, reason)
      VALUES (?, ?, ?)
      `,
      [trick_id, req.user.id, reason]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;