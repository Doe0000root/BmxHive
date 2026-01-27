import jwt from "jsonwebtoken";
import { openDB } from "../db.js";

const secretKey = process.env.JWT_SECRET || "your_secret_key";


export const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    const db = await openDB();
    const user = await db.get(
      `
      SELECT id, email, role, banned, is_admin
      FROM users
      WHERE id = ?
      `,
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      is_admin: Boolean(user.is_admin),
      banned: Boolean(user.banned),
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const requireAdmin = (req, res, next) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({
      code: "NOT_ADMIN",
      message: "Forbidden: Admin access required",
    });
  }
  next();
};


export const blockBanned = (req, res, next) => {
  if (req.user?.banned) {
    return res.status(403).json({
      code: "BANNED",
      message: "Your account is banned",
    });
  }
  next();
};
