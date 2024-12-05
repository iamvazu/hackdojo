from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Progress
from datetime import datetime
from functools import wraps

student_bp = Blueprint('student', __name__)

def student_required():
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user = User.query.get(get_jwt_identity())
            if not current_user or current_user.role != 'student':
                return jsonify({"error": "Student access required"}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@student_bp.route('/dashboard', methods=['GET'])
@student_required()
def get_dashboard():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Get user's progress
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        current_belt = progress.current_belt if progress else "white"
        current_day = progress.current_day if progress else 1
        completed_lessons = progress.completed_lessons if progress else []
        
        return jsonify({
            'status': 'success',
            'data': {
                'user': {
                    'email': user.email,
                    'role': user.role,
                    'created_at': user.created_at.isoformat()
                },
                'progress': {
                    'current_belt': current_belt,
                    'current_day': current_day,
                    'completed_lessons': completed_lessons,
                    'total_days': 100,  # Total days in curriculum
                    'progress_percentage': (current_day / 100) * 100
                }
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/progress', methods=['GET'])
@student_required()
def get_progress():
    try:
        current_user_id = get_jwt_identity()
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        
        if not progress:
            return jsonify({
                'current_belt': 'white',
                'current_day': 1,
                'completed_lessons': [],
                'progress_percentage': 0
            }), 200
            
        return jsonify({
            'current_belt': progress.current_belt,
            'current_day': progress.current_day,
            'completed_lessons': progress.completed_lessons,
            'progress_percentage': (progress.current_day / 100) * 100
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/progress/update', methods=['POST'])
@student_required()
def update_progress():
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        progress = Progress.query.filter_by(user_id=current_user_id).first()
        if not progress:
            progress = Progress(
                user_id=current_user_id,
                current_belt='white',
                current_day=1,
                completed_lessons=[]
            )
            db.session.add(progress)
        
        if 'completed_lesson' in data:
            lesson_day = data['completed_lesson']
            if lesson_day not in progress.completed_lessons:
                progress.completed_lessons.append(lesson_day)
                progress.current_day = max(progress.current_day, lesson_day + 1)
                
                # Update belt based on progress
                if lesson_day >= 96:
                    progress.current_belt = 'black'
                elif lesson_day >= 86:
                    progress.current_belt = 'red'
                elif lesson_day >= 76:
                    progress.current_belt = 'brown'
                elif lesson_day >= 61:
                    progress.current_belt = 'purple'
                elif lesson_day >= 46:
                    progress.current_belt = 'blue'
                elif lesson_day >= 31:
                    progress.current_belt = 'green'
                elif lesson_day >= 21:
                    progress.current_belt = 'orange'
                elif lesson_day >= 11:
                    progress.current_belt = 'yellow'
                
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Progress updated successfully',
            'current_belt': progress.current_belt,
            'current_day': progress.current_day,
            'completed_lessons': progress.completed_lessons
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
