from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, ChildProfile
from datetime import timedelta
import re

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
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')
    role = data.get('role', 'parent')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    is_valid, password_message = is_strong_password(password)
    if not is_valid:
        return jsonify({"error": password_message}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(email=email, role=role)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": role},
        expires_delta=timedelta(days=1)
    )

    return jsonify({
        "message": "Registration successful",
        "access_token": access_token,
        "user": {"id": user.id, "email": user.email, "role": user.role}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role},
        expires_delta=timedelta(days=1)
    )

    return jsonify({
        "access_token": access_token,
        "user": {"id": user.id, "email": user.email, "role": user.role}
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    profile_data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "children": []
    }

    if user.role == 'parent':
        profile_data["children"] = [
            {
                "id": child.id,
                "name": child.name,
                "age": child.age,
                "school": child.school,
                "goals": child.goals,
                "dreams": child.dreams
            }
            for child in user.children
        ]

    return jsonify(profile_data), 200

@auth_bp.route('/child', methods=['POST'])
@jwt_required()
def add_child():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role != 'parent':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    name = data.get('name')
    age = data.get('age')
    school = data.get('school')
    goals = data.get('goals')
    dreams = data.get('dreams')

    if not name:
        return jsonify({"error": "Child name is required"}), 400

    child = ChildProfile(
        name=name,
        age=age,
        school=school,
        goals=goals,
        dreams=dreams,
        parent_id=user_id
    )

    db.session.add(child)
    db.session.commit()

    return jsonify({
        "message": "Child profile created successfully",
        "child": {
            "id": child.id,
            "name": child.name,
            "age": child.age,
            "school": child.school,
            "goals": child.goals,
            "dreams": child.dreams
        }
    }), 201
