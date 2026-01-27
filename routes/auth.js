import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { openDB } from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

router.get("/me", authenticate, async (req, res) => {
  try {
    const db = await openDB();

    const user = await db.get(
      `
      SELECT id, email, name, role, banned, is_admin, bio, avatar_url, points
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("auth/me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

  
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const db = await openDB();
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const result = await db.run(
      "INSERT INTO users (email, password, is_admin, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, 0, role || "user"] 
    );

    
    await db.run(
      "INSERT INTO profiles (user_id, name, bio, riding_level) VALUES (?, ?, ?, ?)",
      [result.lastID, "", "", "beginner"] 
    );

   
    const token = jwt.sign(
      { id: result.lastID, email, role: role || "user" }, 
      JWT_SECRET, 
      { expiresIn: "7d" } 
    );

    res.status(201).json({
      token,
      user: { id: result.lastID, email, role: role || "user" }, 
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

   
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const db = await openDB();
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

   
    const profile = await db.get("SELECT * FROM profiles WHERE user_id = ?", [user.id]);

   
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.is_admin ? "admin" : "user" }, 
      JWT_SECRET, 
      { expiresIn: "7d" } 
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.is_admin ? "admin" : "user", 
        profile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/admin_login", async (req, res) => {
  try {
    const { email, password } = req.body;

 
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const db = await openDB();
    const user = await db.get("SELECT * FROM users WHERE email = ? AND is_admin = 1", [email]);

    
    if (!user) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

   
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    
    const profile = await db.get("SELECT * FROM profiles WHERE user_id = ?", [user.id]);

    
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin === 1,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: "admin", 
        profile,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;





