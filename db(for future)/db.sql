
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
);


CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  bio TEXT,
  riding_level VARCHAR(50) DEFAULT 'beginner',
  favorite_tricks TEXT
);


CREATE TABLE admin_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'guide',
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO users (email, password, is_admin)
VALUES ('admin@gmail.com', 'admin123', TRUE);

INSERT INTO profiles (user_id, name, bio, riding_level)
VALUES (
  (SELECT id FROM users WHERE email='admin@gmail.com'),
  'Admin',
  'Administrator account',
  'admin'
);


DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    bio TEXT,
    riding_level TEXT,
    favorite_tricks TEXT,
    points INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    position INTEGER DEFAULT 0,
    avatar_url TEXT,
    banned BOOLEAN DEFAULT 0
);


