from flask import Flask, jsonify, request, current_app, make_response, send_from_directory
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
from models import db, User, Progress, Belt, FTCProgress
from routes.ftc import ftc
import json
import codecs
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func
import sqlite3
from dateutil import tz
import openai
from gtts import gTTS
import uuid
import os
from flask_migrate import Migrate

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, 
    resources={
        r"/api/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    },
    supports_credentials=True
)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hackdojo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)

# Remove the after_request handler since CORS is handling headers
# @app.after_request
# def after_request(response):
#     origin = request.headers.get('Origin', 'http://localhost:3000')
#     if origin == 'http://localhost:3000':
#         response.headers.add('Access-Control-Allow-Origin', origin)
#         response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#         response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#         response.headers.add('Access-Control-Allow-Credentials', 'true')
#     return response

# Handle OPTIONS requests
@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    return '', 200

# Load environment variables
load_dotenv()

# Configure OpenAI
openai.api_key = os.environ.get('OPENAI_API_KEY')
if not openai.api_key:
    logger.warning("OpenAI API key not found in environment variables!")

# Configure upload folder for audio files
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audio_files')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(parent_bp, url_prefix='/api/parent')
app.register_blueprint(student_bp, url_prefix='/api/student')
app.register_blueprint(ftc)

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
        # Load the curriculum
        with open('curriculum.json', 'r', encoding='utf-8') as f:
            curriculum = json.load(f)

        # Get user's progress
        current_user_id = get_jwt_identity()
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        
        if not progress:
            return jsonify({
                'error': True,
                'message': 'User progress not found'
            }), 404

        # Add progress information to each lesson
        completed_days = json.loads(progress.completed_days)
        for belt in curriculum['belts']:
            for lesson in belt['days']:
                lesson['is_completed'] = lesson['day'] in completed_days
                lesson['is_accessible'] = lesson['day'] <= progress.current_day or lesson['day'] - 1 in completed_days

        return jsonify(curriculum)

    except Exception as e:
        logger.error(f"Error retrieving curriculum: {str(e)}")
        return jsonify({
            'error': True,
            'message': f'Error retrieving curriculum: {str(e)}'
        }), 500

@app.route('/api/lesson/<int:day>', methods=['GET'])
@jwt_required()
def get_lesson(day):
    try:
        current_user_id = get_jwt_identity()
        
        # Get user's progress
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        if not progress:
            # Create initial progress if it doesn't exist
            progress = Progress(
                user_id=current_user_id,
                current_day=1,
                current_belt_id=1,
                completed_days='[]'
            )
            db.session.add(progress)
            db.session.commit()
        
        # Load the curriculum
        try:
            with open('curriculum.json', 'r', encoding='utf-8') as f:
                curriculum = json.load(f)
        except Exception as e:
            logger.error(f"Error loading curriculum: {str(e)}")
            return jsonify({
                'error': True,
                'message': 'Error loading curriculum'
            }), 500

        # Find the lesson and belt for the requested day
        lesson = None
        current_belt = None
        for belt in curriculum['belts']:
            for belt_lesson in belt['days']:
                if belt_lesson['day'] == day:
                    lesson = belt_lesson
                    current_belt = {
                        'name': belt['name'],
                        'color': belt['color'],
                        'startDay': belt['startDay'],
                        'endDay': belt['endDay'],
                        'description': belt['description']
                    }
                    break
            if lesson:
                break

        if not lesson:
            return jsonify({
                'error': True,
                'message': f'No lesson found for day {day}'
            }), 404

        # Parse completed days
        try:
            completed_days = json.loads(progress.completed_days) if progress.completed_days else []
            completed_days = [int(d) for d in completed_days]  # Ensure all days are integers
        except (json.JSONDecodeError, ValueError):
            completed_days = []
            progress.completed_days = '[]'
            db.session.commit()

        # For day 1, always allow access
        # For other days:
        # 1. Allow if it's the user's current day
        # 2. Allow if the previous day is completed
        # 3. Allow if it's already completed
        is_accessible = (
            day == 1 or
            day <= progress.current_day or
            (day - 1) in completed_days or
            day in completed_days
        )

        if not is_accessible:
            return jsonify({
                'error': True,
                'message': 'Previous lessons must be completed first'
            }), 403

        # Add progress information to the lesson
        lesson['is_completed'] = day in completed_days
        lesson['current_progress'] = progress.current_day
        lesson['completed_days'] = completed_days
        lesson['belt'] = current_belt
        lesson['next_day'] = day + 1 if day < 60 else None

        return jsonify(lesson)

    except Exception as e:
        logger.error(f"Error retrieving lesson: {str(e)}")
        return jsonify({
            'error': True,
            'message': f'Error retrieving lesson: {str(e)}'
        }), 500

@app.route('/api/run_code', methods=['POST'])
@jwt_required()
def run_code():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        code = data.get('code', '')
        day = data.get('day', '')
        user_input = data.get('userInput', '')
        
        if not code or not day:
            return jsonify({'error': 'Code and day are required'}), 400

        # Modify the code to inject the input
        modified_code = f'''
import sys
import io

# Redirect stdin to use our input
sys.stdin = io.StringIO("""{user_input}\\n""")

{code}
'''

        # Create a temporary file with the modified code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(modified_code)
            temp_file = f.name

        try:
            # Run the code without input (since we've injected it)
            process = subprocess.Popen(
                ['python', temp_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            output, error = process.communicate()
            
            # Clean up temp file
            try:
                os.unlink(temp_file)
            except:
                pass
            
            if error:
                logger.error(f"Code execution error: {error}")
                return jsonify({'error': error}), 400

            # Get the current lesson
            lesson = get_lesson_by_day(day)
            if not lesson:
                return jsonify({'error': 'Lesson not found'}), 404

            # Check if output matches any test case
            success = False
            for test_case in lesson['exercise']['test_cases']:
                expected = test_case['expected']
                actual_output = output
                logger.debug(f"Expected output (raw): '{expected}'")
                logger.debug(f"Actual output (raw): '{actual_output}'")
                logger.debug(f"Expected output (hex): {expected.encode().hex()}")
                logger.debug(f"Actual output (hex): {actual_output.encode().hex()}")
                logger.debug(f"Expected length: {len(expected)}")
                logger.debug(f"Actual length: {len(actual_output)}")
                if actual_output == expected:
                    success = True
                    break

            if success:
                # Update progress
                current_user_id = get_jwt_identity()
                progress = Progress.query.filter_by(user_id=current_user_id).first()
                if not progress:
                    return jsonify({'error': 'User progress not found'}), 404

                completed_days = json.loads(progress.completed_days)
                if day not in completed_days:
                    completed_days.append(day)
                    progress.completed_days = json.dumps(completed_days)
                    db.session.commit()

                return jsonify({
                    'success': True,
                    'output': output,
                    'message': 'Great job! Moving to next lesson...',
                    'next_day': str(int(day) + 1)
                })
            else:
                return jsonify({
                    'success': False,
                    'output': output,
                    'message': 'Output does not match expected result. Try again!'
                })

        except Exception as e:
            logger.error(f"Error running code: {str(e)}")
            return jsonify({'error': f'Error running code: {str(e)}'}), 400

    except Exception as e:
        logger.error(f"Error in run_code: {str(e)}", exc_info=True)
        return jsonify({
            'error': True,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/progress/init', methods=['POST'])
@jwt_required()
def init_progress():
    try:
        current_user_id = get_jwt_identity()
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        
        if not progress:
            progress = Progress(
                user_id=current_user_id,
                current_day=1,
                current_belt_id=1,
                completed_days='[]'
            )
            db.session.add(progress)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Progress initialized'
        })
    except Exception as e:
        logger.error(f"Error initializing progress: {str(e)}")
        return jsonify({
            'error': True,
            'message': f'Error initializing progress: {str(e)}'
        }), 500

@app.route('/api/progress', methods=['GET'])
@jwt_required()
def get_progress():
    try:
        current_user_id = get_jwt_identity()
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        
        if not progress:
            return jsonify({
                'error': True,
                'message': 'No progress found'
            }), 404
            
        return jsonify({
            'current_day': progress.current_day,
            'current_belt_id': progress.current_belt_id,
            'completed_days': json.loads(progress.completed_days)
        })
    except Exception as e:
        logger.error(f"Error getting progress: {str(e)}")
        return jsonify({
            'error': True,
            'message': f'Error getting progress: {str(e)}'
        }), 500

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
    
    progress = Progress.query.filter_by(user_id=child_id).first()
    if not progress:
        logger.info(f"No progress found for child {child_id}, creating initial progress")
        progress = Progress(
            user_id=child_id,
            current_day=1,
            completed_days=[],
            current_belt_id=1
        )
        db.session.add(progress)
        db.session.commit()

    belts = Belt.query.order_by(Belt.start_day).all()
    current_belt = Belt.query.get(progress.current_belt_id)

    response_data = {
        'child': {
            'name': child.name,
            'email': child.email,
            'current_belt': current_belt.name,
            'completed_lessons': child.completed_lessons,
            'progress': {
                'completed_days': progress.completed_days,
                'current_day': progress.current_day,
                'current_belt': {
                    'id': current_belt.id,
                    'name': current_belt.name,
                    'color': current_belt.color,
                    'start_day': current_belt.start_day,
                    'days_required': current_belt.days_required,
                    'description': current_belt.description
                },
                'all_belts': [{
                    'id': belt.id,
                    'name': belt.name,
                    'color': belt.color,
                    'start_day': belt.start_day,
                    'days_required': belt.days_required,
                    'description': belt.description
                } for belt in belts]
            }
        }
    }
    
    return jsonify(response_data)

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
        Progress.query.filter(Progress.user_id == child_id)
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

@app.route('/api/progress/update', methods=['POST'])
@jwt_required()
def update_progress():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'completed_day' not in data:
            return jsonify({
                'error': True,
                'message': 'Missing completed_day in request'
            }), 400

        completed_day = int(data['completed_day'])
        
        # Get or create progress
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        if not progress:
            progress = Progress(
                user_id=current_user_id,
                current_day=1,
                current_belt_id=1,
                completed_days='[]'
            )
            db.session.add(progress)
            db.session.commit()

        # Update completed days
        try:
            completed_days = json.loads(progress.completed_days) if progress.completed_days else []
            completed_days = [int(d) for d in completed_days]  # Ensure all days are integers
        except (json.JSONDecodeError, ValueError):
            completed_days = []

        if completed_day not in completed_days:
            completed_days.append(completed_day)
            completed_days.sort()
            progress.completed_days = json.dumps(completed_days)
            
            # Update current day to the next day if this was the current day
            if completed_day >= progress.current_day:
                progress.current_day = completed_day + 1

            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                logger.error(f"Error saving progress: {str(e)}")
                return jsonify({
                    'error': True,
                    'message': 'Failed to save progress'
                }), 500

        return jsonify({
            'success': True,
            'message': f'Successfully completed day {completed_day}',
            'current_day': progress.current_day,
            'completed_days': completed_days
        })

    except Exception as e:
        logger.error(f"Error updating progress: {str(e)}")
        return jsonify({
            'error': True,
            'message': str(e)
        }), 500

def get_lesson_by_day(day):
    """Get lesson details from curriculum.json by day number."""
    try:
        # Load curriculum
        with open('curriculum.json', 'r', encoding='utf-8') as f:
            curriculum = json.load(f)

        # Find the lesson for the given day
        day = int(day)
        for belt in curriculum['belts']:
            for belt_lesson in belt['days']:
                if belt_lesson['day'] == day:
                    return belt_lesson
        return None
    except Exception as e:
        logger.error(f"Error getting lesson: {str(e)}")
        return None

def text_to_speech(text):
    """Convert text to speech using Google Text-to-Speech"""
    try:
        # Create a unique filename
        filename = f"speech_{uuid.uuid4()}.mp3"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Generate speech
        tts = gTTS(text=text, lang='en')
        tts.save(filepath)
        
        # Return the URL path to the audio file
        return f"/api/audio/{filename}"
    except Exception as e:
        logger.error(f"Text-to-speech error: {str(e)}")
        return None

@app.route('/api/sensei/ask', methods=['POST'])
@jwt_required()
def ask_sensei():
    try:
        logger.info("Received request to /api/sensei/ask")
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        # Extract question and context
        question = data.get('question', '')
        context = data.get('context', {})
        if isinstance(context, str):
            context = {'currentLesson': context}
        
        voice_enabled = data.get('voice_enabled', False)
        
        if not question:
            logger.warning("No question provided in request")
            return jsonify({
                'error': True,
                'message': 'No question provided'
            }), 400

        # Get current lesson context safely
        current_lesson = context.get('currentLesson', '') if isinstance(context, dict) else str(context)
        current_code = context.get('currentCode', '') if isinstance(context, dict) else ''
        student_progress = context.get('studentProgress', {}) if isinstance(context, dict) else {}
        
        # Build comprehensive context for AI
        ai_context = {
            'lesson': current_lesson,
            'code': current_code,
            'progress': student_progress,
            'previous_interactions': context.get('previousInteractions', []) if isinstance(context, dict) else []
        }
        logger.info(f"Built AI context: {ai_context}")

        # Check OpenAI API key
        if not openai.api_key:
            logger.error("OpenAI API key is not set!")
            return jsonify({
                'error': True,
                'message': 'OpenAI API key is not configured'
            }), 500

        logger.info("Attempting to call OpenAI API...")
        # Call OpenAI API for response
        try:
            openai_response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are Sensei, a wise and patient programming mentor specializing in Python. You provide clear, concise explanations and always encourage students to think critically. Keep responses focused and under 3 paragraphs."},
                    {"role": "user", "content": f"Context: {json.dumps(ai_context)}\nQuestion: {question}"}
                ],
                temperature=0.7,
                max_tokens=500
            )
            response_text = openai_response.choices[0].message.content
            logger.info(f"OpenAI response: {response_text}")

            # Convert response to speech if voice is enabled
            speech_url = None
            if voice_enabled:
                speech_url = text_to_speech(response_text)
                logger.info(f"Generated speech URL: {speech_url}")

            return jsonify({
                'response': response_text,
                'speech_url': speech_url,
                'context': {
                    'lesson': current_lesson,
                    'previousInteractions': context.get('previousInteractions', []) + [
                        {'question': question, 'answer': response_text}
                    ]
                }
            })

        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return jsonify({
                'error': True,
                'message': f'Failed to generate AI response: {str(e)}'
            }), 500

    except Exception as e:
        logger.error(f"Error in ask_sensei: {str(e)}", exc_info=True)
        return jsonify({
            'error': True,
            'message': f'Failed to process your question: {str(e)}'
        }), 500

@app.route('/api/audio/<filename>')
def serve_audio(filename):
    """Serve audio files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

import openai
from gtts import gTTS
import uuid
import os

# Configure OpenAI
openai.api_key = os.environ.get('OPENAI_API_KEY')
if not openai.api_key:
    logger.warning("OpenAI API key not found in environment variables!")

# Configure upload folder for audio files
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def load_curriculum():
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        curriculum_path = os.path.join(current_dir, 'curriculum.json')
        logger.debug(f"Loading curriculum from: {curriculum_path}")

        if not os.path.exists(curriculum_path):
            logger.error(f"curriculum.json not found at {curriculum_path}")
            return None

        with open(curriculum_path, 'r', encoding='utf-8') as f:
            curriculum = json.load(f)

        if not curriculum or not isinstance(curriculum, dict) or 'belts' not in curriculum:
            logger.error("Invalid curriculum format")
            return None

        # Validate belt structure
        for belt in curriculum['belts']:
            if not all(key in belt for key in ['name', 'color', 'startDay', 'endDay', 'days']):
                logger.error(f"Invalid belt format: {belt.get('name', 'unknown')}")
                return None

        logger.info(f"Successfully loaded curriculum with {len(curriculum['belts'])} belts")
        return curriculum

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error loading curriculum: {str(e)}", exc_info=True)
        return None

def create_demo_accounts():
    with app.app_context():
        try:
            logger.debug("Starting to create demo accounts...")
            # Create demo accounts with hashed passwords
            demo_accounts = [
                ('admin', 'admin@hackdojo.com', 'admin123', 'admin'),
                ('parent', 'parent@hackdojo.com', 'parent123', 'parent'),
                ('student', 'student@hackdojo.com', 'student123', 'student')
            ]
            
            for username, email, password, role in demo_accounts:
                # Check if user already exists
                existing_user = User.query.filter_by(email=email).first()
                if not existing_user:
                    # Create new user
                    user = User(
                        username=username,
                        email=email,
                        password_hash=generate_password_hash(password),
                        role=role,
                        created_at=datetime.utcnow(),
                        last_login=datetime.utcnow()
                    )
                    db.session.add(user)
                    logger.debug(f"Created {role} account: {email} with password_hash: {user.password_hash[:20]}...")
                else:
                    logger.debug(f"User {email} already exists")
            
            db.session.commit()
            logger.debug("Demo accounts created successfully!")
            
            # Verify accounts were created
            for _, email, _, _ in demo_accounts:
                user = User.query.filter_by(email=email).first()
                if user:
                    logger.debug(f"Verified user {email} exists with password_hash: {user.password_hash[:20]}...")
                else:
                    logger.debug(f"WARNING: User {email} was not found after creation!")
            
        except Exception as e:
            logger.error(f"Error creating demo accounts: {str(e)}")
            db.session.rollback()

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email', '').lower()
        password = data.get('password', '')

        logger.debug(f"Login attempt for email: {email}")

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Get user from SQLAlchemy
        user = User.query.filter_by(email=email).first()
        
        if user:
            logger.debug(f"Found user {email} with password_hash: {user.password_hash[:20]}...")
            is_valid = check_password_hash(user.password_hash, password)
            logger.debug(f"Password check result: {is_valid}")
        else:
            logger.debug(f"No user found with email: {email}")

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid email or password'}), 401
        else:
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in login: {str(e)}", exc_info=True)
        return jsonify({
            'error': True,
            'message': f'Server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Create demo accounts
        create_demo_accounts()
        
        # Initialize curriculum
        load_curriculum()
        
    app.run(debug=True, host='0.0.0.0', port=5000)
