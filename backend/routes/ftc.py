from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, FTCProgress
import requests
import os
from datetime import datetime

ftc = Blueprint('ftc', __name__)

# GPT-4 API configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
JDOODLE_CLIENT_ID = os.getenv('JDOODLE_CLIENT_ID')
JDOODLE_CLIENT_SECRET = os.getenv('JDOODLE_CLIENT_SECRET')

@ftc.route('/api/ftc/progress', methods=['POST'])
@jwt_required()
def save_progress():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        progress = FTCProgress.query.filter_by(
            user_id=user_id,
            lesson_id=data['lessonId']
        ).first()
        
        if not progress:
            progress = FTCProgress(
                user_id=user_id,
                lesson_id=data['lessonId'],
                completed=data['completed'],
                completed_at=datetime.utcnow() if data['completed'] else None
            )
            db.session.add(progress)
        else:
            progress.completed = data['completed']
            progress.completed_at = datetime.utcnow() if data['completed'] else None
        
        db.session.commit()
        return jsonify({'message': 'Progress saved successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@ftc.route('/api/ftc/progress/<int:user_id>', methods=['GET'])
@jwt_required()
def get_progress(user_id):
    try:
        progress = FTCProgress.query.filter_by(user_id=user_id).all()
        completed_lessons = [p.lesson_id for p in progress if p.completed]
        return jsonify({
            'completedLessons': completed_lessons
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ftc.route('/api/gpt/help', methods=['POST'])
@jwt_required()
def get_gpt_help():
    data = request.get_json()
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4',
                'messages': [
                    {'role': 'system', 'content': 'You are a helpful FTC robotics programming assistant. Help students understand Java programming concepts and FTC-specific implementations.'},
                    {'role': 'user', 'content': f"Code:\n{data['code']}\n\nQuestion:\n{data['question']}"}
                ],
                'temperature': 0.7,
                'max_tokens': 500
            }
        )
        
        answer = response.json()['choices'][0]['message']['content']
        return jsonify({'answer': answer})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ftc.route('/api/compile/java', methods=['POST'])
@jwt_required()
def compile_java():
    data = request.get_json()
    
    try:
        response = requests.post(
            'https://api.jdoodle.com/v1/execute',
            json={
                'clientId': JDOODLE_CLIENT_ID,
                'clientSecret': JDOODLE_CLIENT_SECRET,
                'script': data['code'],
                'language': 'java',
                'versionIndex': '3'
            }
        )
        
        result = response.json()
        return jsonify({
            'output': result.get('output', ''),
            'statusCode': result.get('statusCode', 200),
            'memory': result.get('memory', ''),
            'cpuTime': result.get('cpuTime', '')
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
