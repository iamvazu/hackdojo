-- User table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    user_id INTEGER NOT NULL,
    current_day INTEGER DEFAULT 1,
    current_belt TEXT DEFAULT 'white',
    last_completed_day INTEGER DEFAULT 0,
    completed_days TEXT DEFAULT '[]',  -- JSON array of completed days
    unlocked_belts TEXT DEFAULT '["white"]',  -- JSON array of unlocked belts
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    PRIMARY KEY (user_id)
);

-- Exercise attempts table
CREATE TABLE IF NOT EXISTS exercise_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    day INTEGER NOT NULL,
    code TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    output TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
