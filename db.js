import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function openDB() {
  return open({
    filename: join(__dirname, "bmx-hive.db"),
    driver: sqlite3.Database,
  });
}

export async function initDB() {
  const db = await openDB();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_admin INTEGER DEFAULT 0,
      banned INTEGER DEFAULT 0,
      name TEXT,
      bio TEXT,
      points INTEGER DEFAULT 0,
      avatar_url TEXT
    );
  `);

  const userCols = await db.all(`PRAGMA table_info(users);`);
  const addUserCol = async (name, sql) => {
    if (!userCols.some(c => c.name === name)) {
      await db.exec(sql);
    }
  };

  await addUserCol("role", `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';`);
  await addUserCol("is_admin", `ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;`);
  await addUserCol("banned", `ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0;`);
  await addUserCol("name", `ALTER TABLE users ADD COLUMN name TEXT;`);
  await addUserCol("bio", `ALTER TABLE users ADD COLUMN bio TEXT;`);
  await addUserCol("points", `ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;`);
  await addUserCol("avatar_url", `ALTER TABLE users ADD COLUMN avatar_url TEXT;`);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      name TEXT DEFAULT 'Newbie Rider',
      bio TEXT,
      favorite_tricks TEXT,
      points INTEGER DEFAULT 0,
      avatar_url TEXT,
      riding_level TEXT DEFAULT 'beginner',
      trick_videos TEXT,
      rating REAL DEFAULT 0,
      position INTEGER DEFAULT 0,
      banned INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  const profileCols = await db.all(`PRAGMA table_info(profiles);`);
  const addProfileCol = async (name, sql) => {
    if (!profileCols.some(c => c.name === name)) {
      await db.exec(sql);
    }
  };

  await addProfileCol("favorite_tricks", `ALTER TABLE profiles ADD COLUMN favorite_tricks TEXT;`);
  await addProfileCol("points", `ALTER TABLE profiles ADD COLUMN points INTEGER DEFAULT 0;`);
  await addProfileCol("avatar_url", `ALTER TABLE profiles ADD COLUMN avatar_url TEXT;`);
  await addProfileCol("riding_level", `ALTER TABLE profiles ADD COLUMN riding_level TEXT DEFAULT 'beginner';`);
  await addProfileCol("trick_videos", `ALTER TABLE profiles ADD COLUMN trick_videos TEXT;`);
  await addProfileCol("rating", `ALTER TABLE profiles ADD COLUMN rating REAL DEFAULT 0;`);
  await addProfileCol("position", `ALTER TABLE profiles ADD COLUMN position INTEGER DEFAULT 0;`);
  await addProfileCol("banned", `ALTER TABLE profiles ADD COLUMN banned INTEGER DEFAULT 0;`);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tricks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      level TEXT DEFAULT 'beginner',
      hashtags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'guide',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await db.exec(`
    INSERT INTO profiles (user_id, name, bio, avatar_url, points, banned)
    SELECT u.id, u.name, u.bio, u.avatar_url, u.points, u.banned
    FROM users u
    WHERE NOT EXISTS (
      SELECT 1 FROM profiles p WHERE p.user_id = u.id
    );
  `);

  const admin = await db.get(
    `SELECT * FROM users WHERE email = ?`,
    ["admin@gmail.com"]
  );

  if (!admin) {
    const hashed = await bcrypt.hash("admin", 10);

    const res = await db.run(
      `
      INSERT INTO users (email, password, role, is_admin, name, bio, points)
      VALUES (?, ?, 'admin', 1, 'Admin', 'Administrator', 0)
      `,
      ["admin@gmail.com", hashed]
    );

    await db.run(
      `
      INSERT INTO profiles (user_id, name, bio, riding_level)
      VALUES (?, 'Admin', 'Administrator', 'admin')
      `,
      [res.lastID]
    );

    console.log("Admin account created");
  } else if (admin.is_admin !== 1 || admin.role !== "admin") {
    await db.run(
      `UPDATE users SET is_admin = 1, role = 'admin' WHERE email = ?`,
      ["admin@gmail.com"]
    );
    console.log("✅ Admin privileges restored");
  }

  console.log("DB READY");
}
