from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt, create_access_token
from functools import wraps
import os
import tempfile
import subprocess
import logging
from dotenv import load_dotenv
from auth import auth_bp
from parent import parent_bp
from student import student_bp
from models import db, User
import json
import codecs
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from sqlalchemy import func
import sqlite3

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'error': True,
        'message': 'Token has expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'error': True,
        'message': 'Invalid token'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'error': True,
        'message': 'Missing token'
    }), 401

def get_db():
    if not hasattr(get_db, 'db'):
        db_path = os.path.join(os.path.dirname(__file__), 'hackdojo.db')
        get_db.db = sqlite3.connect(db_path)
        get_db.db.row_factory = sqlite3.Row
    return get_db.db

def init_db():
    db = get_db()
    cursor = db.cursor()
    
    # Create tables
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            role TEXT DEFAULT 'student'
        );
        
        CREATE TABLE IF NOT EXISTS user_progress (
            user_id INTEGER PRIMARY KEY,
            current_day INTEGER DEFAULT 1,
            current_belt TEXT DEFAULT 'white',
            completed_days TEXT DEFAULT '[]',
            unlocked_belts TEXT DEFAULT '["white"]',
            FOREIGN KEY (user_id) REFERENCES users (id)
        );
    ''')
    
    db.commit()
    logger.info("Database initialized successfully!")

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hackdojo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(parent_bp, url_prefix='/api/parent')
app.register_blueprint(student_bp, url_prefix='/api/student')

# CORS configuration
CORS(app, 
     resources={
         r"/api/*": {
             "origins": ["http://localhost:3000", "http://localhost:3001"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept"],
             "supports_credentials": True
         }
     })

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated

# Parent-specific route decorators
def parent_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        jwt = get_jwt()
        if jwt.get("role") != "parent":
            return jsonify({"msg": "Parent access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    
    origin = request.headers.get('Origin')
    if origin in ['http://localhost:3000', 'http://localhost:3001']:
        response.headers.set('Access-Control-Allow-Origin', origin)
    
    return response

# Admin-only routes
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_list_users():
    try:
        users = User.query.all()
        return jsonify({
            'users': [{
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            } for user in users]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
@admin_required
def admin_get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def admin_update_role(user_id):
    try:
        data = request.get_json()
        if not data or 'role' not in data:
            return jsonify({'error': 'Role is required'}), 400
            
        new_role = data['role']
        if new_role not in ['student', 'parent', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': 'User role updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
@admin_required
def admin_get_users():
    users = User.query.all()
    return jsonify({
        'users': [{
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'current_belt': user.current_belt,
            'completed_lessons': user.completed_lessons,
            'active': user.active,
            'created_at': user.created_at.isoformat() if user.created_at else None
        } for user in users]
    })

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def admin_update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'role' in data:
        user.role = data['role']
    if 'active' in data:
        user.active = data['active']
    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
        
    db.session.commit()
    return jsonify({'message': 'User updated successfully'})

@app.route('/api/admin/lessons', methods=['POST'])
@jwt_required()
@admin_required
def admin_add_lesson():
    data = request.get_json()
    
    try:
        curriculum = load_curriculum()
        new_lesson = {
            'day': data['day'],
            'title': data['title'],
            'content': data['content'],
            'exercise': {
                'title': data['exercise_title'],
                'description': data['exercise_description'],
                'hint': data['exercise_hint'],
                'starter_code': data['starter_code'],
                'test_cases': data['test_cases']
            }
        }
        
        curriculum['lessons'][str(data['day'])] = new_lesson
        
        # Save to curriculum.json
        with open(os.path.join(os.path.dirname(__file__), 'curriculum.json'), 'w') as f:
            json.dump(curriculum, f, indent=2)
            
        return jsonify({'message': 'Lesson added successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/analytics', methods=['GET'])
@jwt_required()
@admin_required
def admin_get_analytics():
    try:
        total_users = User.query.count()
        students = User.query.filter_by(role='student').count()
        parents = User.query.filter_by(role='parent').count()
        
        # Get activity in the last 30 days
        thirty_days_ago = datetime.datetime.now() - datetime.timedelta(days=30)
        recent_activity = Progress.query.filter(Progress.timestamp >= thirty_days_ago).count()
        
        # Get completion rates
        total_lessons = len(load_curriculum()['lessons'])
        completion_data = db.session.query(
            User.current_belt,
            func.count(User.id)
        ).filter_by(role='student').group_by(User.current_belt).all()
        
        belt_distribution = {belt: count for belt, count in completion_data}
        
        return jsonify({
            'user_stats': {
                'total_users': total_users,
                'students': students,
                'parents': parents
            },
            'activity': {
                'last_30_days': recent_activity
            },
            'completion': {
                'total_lessons': total_lessons,
                'belt_distribution': belt_distribution
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/curriculum', methods=['GET'])
@jwt_required()
def get_curriculum():
    try:
        curriculum = load_curriculum()
        if not curriculum or 'belts' not in curriculum:
            return jsonify({
                'error': True,
                'message': 'Invalid curriculum format'
            }), 500
        return jsonify(curriculum)
    except Exception as e:
        return jsonify({
            'error': True,
            'message': str(e)
        }), 500

@app.route('/api/lesson/<int:day>', methods=['GET'])
@jwt_required()
def get_lesson(day):
    try:
        logger.debug(f"Fetching lesson for day {day}")
        curriculum = load_curriculum()
        
        logger.debug(f"Curriculum loaded: {bool(curriculum)}")
        logger.debug(f"Belts in curriculum: {len(curriculum.get('belts', []))}")
        
        if not curriculum or 'belts' not in curriculum:
            logger.error("Invalid curriculum format")
            return jsonify({
                'error': True,
                'message': 'Invalid curriculum format'
            }), 500
            
        # Find the belt containing this day
        for belt in curriculum['belts']:
            logger.debug(f"Checking belt {belt.get('name')}: days {belt.get('startDay')} to {belt.get('endDay')}")
            if belt['startDay'] <= day <= belt['endDay']:
                # Find the specific day's lesson
                for lesson in belt.get('days', []):
                    if lesson['day'] == day:
                        logger.info(f"Found lesson for day {day}")
                        return jsonify(lesson)
                
                logger.warning(f"No specific lesson found for day {day} in matching belt")
                # If day not found in belt, return empty lesson template
                return jsonify({
                    'day': day,
                    'title': f'Day {day}',
                    'content': 'Lesson content coming soon!',
                    'exercise': {
                        'title': 'Practice Exercise',
                        'description': 'Stay tuned for today\'s exercise!',
                        'starterCode': '# Your code here\n',
                        'hint': 'Check back later for hints',
                        'test_cases': []
                    }
                })
        
        logger.warning(f"Day {day} not found in any belt")
        return jsonify({
            'error': True,
            'message': f'Day {day} not found in curriculum'
        }), 404
        
    except Exception as e:
        logger.error(f"Error in get_lesson: {str(e)}", exc_info=True)
        return jsonify({
            'error': True,
            'message': str(e)
        }), 500

@app.route('/api/run', methods=['POST'])
@jwt_required()
def run_code():
    try:
        if not request.is_json:
            return jsonify({
                'error': True,
                'message': 'Missing JSON in request'
            }), 400

        code = request.json.get('code')
        if not code:
            return jsonify({
                'error': True,
                'message': 'No code provided'
            }), 400

        logger.debug(f"Running code: {code}")
        
        # Create a temporary file to run the code
        temp_file = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
                logger.debug(f"Created temporary file: {temp_file}")
            
            # Run the code and capture output
            logger.debug("Executing code...")
            result = subprocess.run(
                ['python', temp_file], 
                capture_output=True,
                text=True,
                timeout=5  # 5 second timeout
            )
            
            logger.debug(f"Code execution completed. Return code: {result.returncode}")
            logger.debug(f"Stdout: {result.stdout}")
            logger.debug(f"Stderr: {result.stderr}")
            
            return jsonify({
                'output': result.stdout,
                'error': result.stderr,
                'success': result.returncode == 0
            })
            
        except subprocess.TimeoutExpired:
            logger.warning("Code execution timed out")
            return jsonify({
                'error': True,
                'message': 'Code execution timed out (5 second limit)'
            }), 408
            
        except Exception as e:
            logger.error(f"Error executing code: {str(e)}", exc_info=True)
            return jsonify({
                'error': True,
                'message': f'Error executing code: {str(e)}'
            }), 500
            
        finally:
            # Clean up temporary file
            if temp_file:
                try:
                    os.unlink(temp_file)
                    logger.debug(f"Cleaned up temporary file: {temp_file}")
                except Exception as e:
                    logger.error(f"Error cleaning up temporary file: {str(e)}")
            
    except Exception as e:
        logger.error(f"Unexpected error in run_code: {str(e)}", exc_info=True)
        return jsonify({
            'error': True,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/progress', methods=['POST'])
@jwt_required()
def update_progress():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'day' not in data:
            return jsonify({'error': 'Day number is required'}), 400
            
        day = data['day']
        success = data.get('success', True)  # Default to True if not specified
        
        # Get current user's progress
        user_progress = get_user_progress(current_user_id)
        
        # Update progress
        if success:
            completed_days = user_progress['completed_days']
            if day not in completed_days:
                completed_days.append(day)
                completed_days.sort()
            
            # Calculate next day
            next_day = day + 1
            
            # Get curriculum to check belt boundaries
            with open('curriculum.json', 'r') as f:
                curriculum = json.load(f)
            
            current_belt = None
            for belt in curriculum['belts']:
                if belt['startDay'] <= day <= belt['endDay']:
                    current_belt = belt['name']
                    if next_day > belt['endDay']:
                        next_day = None  # End of belt reached
                    break
            
            # Update user_progress table
            db = get_db()
            cursor = db.cursor()
            
            cursor.execute('''
                UPDATE user_progress 
                SET completed_days = ?, 
                    current_day = ?, 
                    current_belt = ?
                WHERE user_id = ?
            ''', (
                json.dumps(completed_days),
                next_day if next_day else day,
                current_belt,
                current_user_id
            ))
            
            db.commit()
            
            return jsonify({
                'success': True,
                'completed_days': completed_days,
                'current_day': next_day if next_day else day,
                'current_belt': current_belt,
                'next_day': next_day
            })
            
    except Exception as e:
        logger.error(f"Error updating progress: {str(e)}", exc_info=True)
        return jsonify({
            'error': True,
            'message': f'Error updating progress: {str(e)}'
        }), 500

# Parent routes
@app.route('/api/parent/children', methods=['GET'])
@jwt_required()
@parent_required
def get_children():
    parent_id = get_jwt_identity()
    parent = User.query.get(parent_id)
    
    if not parent:
        return jsonify({"error": "Parent not found"}), 404
        
    children = User.query.filter_by(parent_id=parent_id).all()
    return jsonify({
        "children": [{
            "id": child.id,
            "name": child.name,
            "email": child.email,
            "current_belt": child.current_belt,
            "completed_lessons": child.completed_lessons
        } for child in children]
    })

@app.route('/api/parent/child/<int:child_id>/progress', methods=['GET'])
@jwt_required()
@parent_required
def get_child_progress(child_id):
    parent_id = get_jwt_identity()
    
    # Verify the child belongs to this parent
    child = User.query.filter_by(id=child_id, parent_id=parent_id).first()
    if not child:
        return jsonify({"error": "Child not found or access denied"}), 404
    
    progress = get_user_progress(child_id)
    return jsonify({
        "child": {
            "name": child.name,
            "email": child.email,
            "current_belt": child.current_belt,
            "completed_lessons": child.completed_lessons,
            "progress": progress
        }
    })

@app.route('/api/parent/child/<int:child_id>/recent-activity', methods=['GET'])
@jwt_required()
@parent_required
def get_child_activity(child_id):
    parent_id = get_jwt_identity()
    
    # Verify the child belongs to this parent
    child = User.query.filter_by(id=child_id, parent_id=parent_id).first()
    if not child:
        return jsonify({"error": "Child not found or access denied"}), 404
    
    # Get recent activity (last 30 days)
    recent_activity = (
        db.session.query(Progress)
        .filter(Progress.user_id == child_id)
        .order_by(Progress.timestamp.desc())
        .limit(30)
        .all()
    )
    
    return jsonify({
        "recent_activity": [{
            "lesson": activity.lesson,
            "timestamp": activity.timestamp,
            "success": activity.success
        } for activity in recent_activity]
    })

def load_curriculum():
    try:
        # Get the absolute path to curriculum.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        curriculum_path = os.path.join(current_dir, 'curriculum.json')
        logger.debug(f"Looking for curriculum at: {curriculum_path}")
        
        if not os.path.exists(curriculum_path):
            logger.error(f"curriculum.json not found at {curriculum_path}")
            # Try looking in the parent directory
            parent_dir = os.path.dirname(current_dir)
            curriculum_path = os.path.join(parent_dir, 'curriculum.json')
            logger.debug(f"Trying parent directory: {curriculum_path}")
            
            if not os.path.exists(curriculum_path):
                logger.error(f"curriculum.json not found in parent directory either")
                return {"belts": []}
            
        logger.debug(f"Reading curriculum from: {curriculum_path}")
        try:
            with codecs.open(curriculum_path, 'r', encoding='utf-8-sig') as f:
                content = f.read()
                logger.debug(f"File content length: {len(content)} bytes")
                curriculum = json.loads(content)
                
            if not curriculum:
                logger.error("Curriculum is empty")
                return {"belts": []}
                
            if not isinstance(curriculum, dict):
                logger.error(f"Curriculum is not a dictionary, got {type(curriculum)}")
                return {"belts": []}
                
            if 'belts' not in curriculum:
                logger.error("No 'belts' key in curriculum")
                return {"belts": []}
                
            belts = curriculum['belts']
            if not isinstance(belts, list):
                logger.error(f"'belts' is not a list, got {type(belts)}")
                return {"belts": []}
                
            logger.info(f"Successfully loaded curriculum with {len(belts)} belts")
            return curriculum
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            logger.error(f"Problem near position {e.pos}: {content[max(0, e.pos-50):e.pos+50]}")
            return {"belts": []}
            
    except Exception as e:
        logger.error(f"Unexpected error in load_curriculum: {str(e)}", exc_info=True)
        return {"belts": []}

def get_user_progress(user_id=1):
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
    if not cursor.fetchone():
        cursor.execute('INSERT INTO users (id, username) VALUES (?, ?)', (user_id, f'user_{user_id}'))
        db.commit()
    
    cursor.execute('''
        SELECT current_day, current_belt, completed_days, unlocked_belts
        FROM user_progress
        WHERE user_id = ?
    ''', (user_id,))
    
    progress = cursor.fetchone()
    if not progress:
        cursor.execute('''
            INSERT INTO user_progress (user_id)
            VALUES (?)
        ''', (user_id,))
        db.commit()
        return {
            'current_day': 1,
            'current_belt': 'white',
            'completed_days': [],
            'unlocked_belts': ['white']
        }
    
    return {
        'current_day': progress['current_day'],
        'current_belt': progress['current_belt'],
        'completed_days': json.loads(progress['completed_days']),
        'unlocked_belts': json.loads(progress['unlocked_belts'])
    }

def update_user_progress(user_id, day, success):
    if not success:
        return
    
    db = get_db()
    cursor = db.cursor()
    
    progress = get_user_progress(user_id)
    completed_days = progress['completed_days']
    unlocked_belts = progress['unlocked_belts']
    
    if day not in completed_days:
        completed_days.append(day)
        completed_days.sort()
    
    curriculum = load_curriculum()
    current_belt = progress['current_belt']
    
    for belt in curriculum['belts']:
        if belt['name'] not in unlocked_belts and len(completed_days) >= belt['requiredDays']:
            unlocked_belts.append(belt['name'])
            current_belt = belt['name']
    
    cursor.execute('''
        UPDATE user_progress
        SET completed_days = ?,
            current_belt = ?,
            unlocked_belts = ?,
            current_day = ?,
            last_completed_day = ?
        WHERE user_id = ?
    ''', (
        json.dumps(completed_days),
        current_belt,
        json.dumps(unlocked_belts),
        day + 1,
        day,
        user_id
    ))
    
    db.commit()

def create_demo_accounts():
    with app.app_context():
        try:
            # Create demo accounts with hashed passwords
            demo_accounts = [
                ('admin@hackdojo.com', 'admin123', 'admin'),
                ('parent@hackdojo.com', 'parent123', 'parent'),
                ('student@hackdojo.com', 'student123', 'student')
            ]
            
            for email, password, role in demo_accounts:
                # Check if user already exists
                if not User.query.filter_by(email=email).first():
                    # Create new user
                    user = User(
                        email=email,
                        password_hash=generate_password_hash(password),
                        role=role,
                        created_at=datetime.utcnow(),
                        last_login=datetime.utcnow()
                    )
                    db.session.add(user)
                    print(f"Created {role} account: {email}")
            
            db.session.commit()
            print("Demo accounts created successfully!")
            
        except Exception as e:
            print(f"Error creating demo accounts: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    init_db()
    create_demo_accounts()  # Create demo accounts on startup
    app.run(debug=True, port=5000)
