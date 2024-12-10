import sqlite3
import os
import json
from werkzeug.security import generate_password_hash
from datetime import datetime

def init_db():
    # Get the path to the database
    db_path = os.path.join(os.path.dirname(__file__), 'hackdojo.db')
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Read and execute schema
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql'), 'r') as f:
        cursor.executescript(f.read())
    
    # Initialize belts
    belts = [
        ('White Belt', 'white', 1, 7, 'Beginning your journey'),
        ('Yellow Belt', 'yellow', 8, 14, 'Learning the basics'),
        ('Orange Belt', 'orange', 15, 21, 'Building fundamentals'),
        ('Green Belt', 'green', 22, 28, 'Growing stronger'),
        ('Blue Belt', 'blue', 29, 35, 'Advancing skills'),
        ('Purple Belt', 'purple', 36, 42, 'Mastering concepts'),
        ('Brown Belt', 'brown', 43, 49, 'Near mastery'),
        ('Black Belt', 'black', 50, 56, 'Achievement unlocked')
    ]
    
    cursor.executemany('''
        INSERT INTO belts (name, color, start_day, days_required, description)
        VALUES (?, ?, ?, ?, ?)
    ''', belts)
    
    # Create demo accounts
    demo_accounts = [
        ('admin', 'admin123', 'admin@hackdojo.com', 'admin'),
        ('parent', 'parent123', 'parent@hackdojo.com', 'parent'),
        ('student', 'student123', 'student@hackdojo.com', 'student')
    ]
    
    for username, password, email, role in demo_accounts:
        cursor.execute('''
            INSERT INTO users (username, password_hash, email, role, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            username,
            generate_password_hash(password),
            email,
            role,
            datetime.utcnow(),
            datetime.utcnow()
        ))
        
        # Initialize progress for student account
        if role == 'student':
            user_id = cursor.lastrowid
            cursor.execute('''
                INSERT INTO user_progress (user_id, current_day, current_belt_id, completed_days)
                VALUES (?, ?, ?, ?)
            ''', (user_id, 1, 1, '[]'))
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Database initialized successfully!")

if __name__ == '__main__':
    init_db()
