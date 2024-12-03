-- User table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'parent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Child profile table
CREATE TABLE IF NOT EXISTS child_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    school TEXT,
    goals TEXT,
    dreams TEXT,
    parent_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id)
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    week TEXT NOT NULL,
    day INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    code_submission TEXT,
    points_earned INTEGER DEFAULT 0,
    FOREIGN KEY (child_id) REFERENCES child_profile(id)
);

-- Achievement table
CREATE TABLE IF NOT EXISTS achievement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    badge_image TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES child_profile(id)
);
