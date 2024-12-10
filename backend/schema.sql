-- Initialize the database schema

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS belts;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE belts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    start_day INTEGER NOT NULL,
    days_required INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    current_day INTEGER DEFAULT 1,
    current_belt_id INTEGER DEFAULT 1,
    completed_days TEXT DEFAULT '[]',  -- JSON array of completed day numbers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (current_belt_id) REFERENCES belts (id)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_belt_id ON user_progress(current_belt_id);

-- Insert belt data
INSERT INTO belts (name, color, start_day, days_required, description) VALUES
    ('White Belt', '#FFFFFF', 1, 10, 'Begin your Python journey'),
    ('Yellow Belt', '#FFD700', 11, 10, 'Build your foundation'),
    ('Orange Belt', '#FFA500', 21, 10, 'Explore data structures'),
    ('Green Belt', '#228B22', 31, 10, 'Master control flow'),
    ('Blue Belt', '#0000FF', 41, 10, 'Dive into functions'),
    ('Purple Belt', '#800080', 51, 10, 'Object-oriented programming'),
    ('Brown Belt', '#8B4513', 61, 10, 'Advanced concepts'),
    ('Red Belt', '#FF0000', 71, 10, 'Project development'),
    ('Black Belt', '#000000', 81, 20, 'Full-stack mastery');

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
