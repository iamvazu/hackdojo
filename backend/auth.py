from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import re
import sqlite3
import os
from models import db, User, ChildProfile

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_username(username):
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
    return True, "Username is valid"

def is_strong_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is strong"

def get_db():
    db_path = os.path.join(os.path.dirname(__file__), 'hackdojo.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        email = data.get('email', '').lower()
        password = data.get('password', '')
        role = data.get('role', 'student')
        username = data.get('username', '')
        
        # Validate role
        if role not in ['student', 'parent', 'admin']:
            return jsonify({'error': 'Invalid role specified'}), 400

        # Validate required fields
        if not email or not password or not username:
            return jsonify({'error': 'Email, password, and username are required'}), 400
        
        # Validate email
        if not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate username
        is_valid_user, user_msg = is_valid_username(username)
        if not is_valid_user:
            return jsonify({'error': user_msg}), 400

        # Validate password
        is_valid_pass, pass_msg = is_strong_password(password)
        if not is_valid_pass:
            return jsonify({'error': pass_msg}), 400

        # Get database connection
        conn = get_db()
        cursor = conn.cursor()

        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = ? OR username = ?', (email, username))
        if cursor.fetchone():
            return jsonify({'error': 'Email or username already registered'}), 400

        # Hash the password
        password_hash = generate_password_hash(password)
        
        # Create user in database
        cursor.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            (username, email, password_hash, role)
        )
        user_id = cursor.lastrowid

        # Initialize user progress with white belt
        if role == 'student':
            cursor.execute(
                'INSERT INTO user_progress (user_id, current_belt_id, current_day, completed_days) VALUES (?, ?, ?, ?)',
                (user_id, 1, 1, '[]')
            )
        
        # Commit changes
        conn.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user_id,
            additional_claims={'role': role}
        )
        
        # Fetch belt info for students
        belt_info = None
        if role == 'student':
            cursor.execute('''
                SELECT b.* FROM belts b
                JOIN user_progress up ON b.id = up.current_belt_id
                WHERE up.user_id = ?
            ''', (user_id,))
            belt = cursor.fetchone()
            if belt:
                belt_info = {
                    'id': belt['id'],
                    'name': belt['name'],
                    'color': belt['color'],
                    'days_required': belt['days_required']
                }
        
        # Prepare response
        response = {
            'token': access_token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'role': role,
                'belt': belt_info if role == 'student' else None
            },
            'redirectUrl': '/dashboard'
        }
        
        return jsonify(response), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email', '').lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        conn = get_db()
        cursor = conn.cursor()

        # Get user
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()

        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Get belt info for students
        belt_info = None
        if user['role'] == 'student':
            cursor.execute('''
                SELECT b.* FROM belts b
                JOIN user_progress up ON b.id = up.current_belt_id
                WHERE up.user_id = ?
            ''', (user['id'],))
            belt = cursor.fetchone()
            if belt:
                belt_info = {
                    'id': belt['id'],
                    'name': belt['name'],
                    'color': belt['color'],
                    'days_required': belt['days_required']
                }

        # Create access token
        access_token = create_access_token(
            identity=user['id'],
            additional_claims={'role': user['role']}
        )

        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'belt': belt_info if user['role'] == 'student' else None
            },
            'redirectUrl': '/dashboard'
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        
        conn = get_db()
        cursor = conn.cursor()

        # Get user info
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get belt info for students
        belt_info = None
        if user['role'] == 'student':
            cursor.execute('''
                SELECT b.*, up.completed_days, up.current_day
                FROM belts b
                JOIN user_progress up ON b.id = up.current_belt_id
                WHERE up.user_id = ?
            ''', (user_id,))
            progress = cursor.fetchone()
            if progress:
                belt_info = {
                    'id': progress['id'],
                    'name': progress['name'],
                    'color': progress['color'],
                    'days_required': progress['days_required'],
                    'current_day': progress['current_day'],
                    'completed_days': progress['completed_days']
                }

        return jsonify({
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'belt': belt_info if user['role'] == 'student' else None
            }
        }), 200

    except Exception as e:
        print(f"Profile error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals():
            conn.close()
