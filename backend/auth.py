from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import re
from models import db, User, ChildProfile

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

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

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        email = data.get('email', '').lower()
        password = data.get('password', '')
        role = data.get('role', 'student')
        
        # Validate role
        if role not in ['student', 'parent', 'admin']:
            return jsonify({'error': 'Invalid role specified'}), 400

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        is_valid, msg = is_strong_password(password)
        if not is_valid:
            return jsonify({'error': msg}), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Make first user admin
        user_count = User.query.count()
        if user_count == 0:
            role = 'admin'

        # Hash the password
        password_hash = generate_password_hash(password)
        
        # Create user in database
        user = User(
            email=email,
            password_hash=password_hash,
            role=role
        )
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'role': user.role}
        )
        
        # Prepare response based on role
        response = {
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        }

        # Add role-specific data
        if user.role == 'parent':
            response['user']['children'] = []
            response['redirectUrl'] = '/parent/dashboard'
        elif user.role == 'student':
            response['redirectUrl'] = '/student'
        elif user.role == 'admin':
            response['redirectUrl'] = '/admin/dashboard'
        
        return jsonify(response), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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

        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
            
        if not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Create access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'role': user.role}
        )
        
        # Prepare response
        response = {
            'token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        }

        # Add role-specific data and redirect URLs
        if user.role == 'parent':
            children = ChildProfile.query.filter_by(parent_id=user.id).all()
            response['user']['children'] = [
                {
                    'id': child.id,
                    'name': child.name,
                    'belt_level': child.belt_level
                } for child in children
            ]
            response['redirectUrl'] = '/parent'
        elif user.role == 'student':
            response['redirectUrl'] = '/student'
        elif user.role == 'admin':
            response['redirectUrl'] = '/admin'

        return jsonify(response), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        response = {
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        }

        # Add role-specific data
        if user.role == 'parent':
            children = ChildProfile.query.filter_by(parent_id=user.id).all()
            response['user']['children'] = [
                {
                    'id': child.id,
                    'name': child.name,
                    'belt_level': child.belt_level
                } for child in children
            ]
            
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
