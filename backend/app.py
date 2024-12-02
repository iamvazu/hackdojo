from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import sqlite3
import subprocess
import tempfile
from datetime import datetime

app = Flask(__name__)

# Configure CORS for development
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

def get_db():
    db = sqlite3.connect('hackdojo.db')
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.open_resource('schema.sql', mode='r') as f:
        get_db().executescript(f.read())

# Load curriculum data
def load_curriculum():
    try:
        with open(os.path.join(os.path.dirname(__file__), 'curriculum.json'), 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"belts": []}

def get_user_progress(user_id=1):  # Default user_id for now
    db = get_db()
    cursor = db.cursor()
    
    # Check if user exists, if not create one
    cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
    if not cursor.fetchone():
        cursor.execute('INSERT INTO users (id, username) VALUES (?, ?)', (user_id, f'user_{user_id}'))
        db.commit()
    
    # Get or create user progress
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
    
    # Get current progress
    progress = get_user_progress(user_id)
    completed_days = progress['completed_days']
    unlocked_belts = progress['unlocked_belts']
    
    # Update completed days
    if day not in completed_days:
        completed_days.append(day)
        completed_days.sort()
    
    # Load curriculum to check belt requirements
    curriculum = load_curriculum()
    current_belt = progress['current_belt']
    
    # Check if user should advance to next belt
    for belt in curriculum['belts']:
        if belt['name'] not in unlocked_belts and len(completed_days) >= belt['requiredDays']:
            unlocked_belts.append(belt['name'])
            current_belt = belt['name']
    
    # Update database
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

# Curriculum and progress endpoints
@app.route('/api/curriculum', methods=['GET'])
def get_curriculum():
    """Get the full curriculum structure with user progress"""
    try:
        curriculum = load_curriculum()
        if not curriculum or 'belts' not in curriculum:
            return jsonify({'belts': []})
            
        user_progress = get_user_progress()
        current_day = user_progress.get('current_day', 1)
        completed_days = user_progress.get('completed_days', [])
        
        # Transform curriculum data to include progress
        for belt in curriculum['belts']:
            if 'days' not in belt:
                belt['days'] = []
                
            for day in belt['days']:
                day['isCompleted'] = day['day'] in completed_days
                day['isLocked'] = day['day'] > current_day
        
        return jsonify(curriculum)
    except Exception as e:
        print(f"Error in get_curriculum: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/lesson/<int:day>', methods=['GET'])
def get_lesson(day):
    """Get lesson content for a specific day"""
    try:
        curriculum = load_curriculum()
        if not curriculum or 'belts' not in curriculum:
            return jsonify({'error': 'Invalid curriculum data'}), 500
            
        # Find the lesson for the given day
        for belt in curriculum['belts']:
            if 'days' not in belt:
                continue
                
            for lesson in belt['days']:
                if lesson.get('day') == day:
                    # Add belt context to the lesson
                    lesson_data = {
                        **lesson,
                        'belt': {
                            'name': belt['name'],
                            'displayName': belt.get('displayName', belt['name']),
                            'color': belt.get('color', '#f8f9fa')
                        }
                    }
                    return jsonify(lesson_data)
        
        return jsonify({'error': f'No lesson found for day {day}'}), 404
        
    except Exception as e:
        print(f"Error in get_lesson: {str(e)}")
        return jsonify({'error': 'Failed to load lesson'}), 500

@app.route('/api/exercise/validate', methods=['POST'])
def validate_exercise():
    """Validate user's exercise solution"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        day = data.get('day')
        
        if not code or not day:
            return jsonify({
                'success': False,
                'message': 'Missing code or day parameter',
                'output': 'Please provide both code and day parameters.'
            }), 400

        # Load curriculum to get test cases
        curriculum = load_curriculum()
        
        # Find the exercise for the given day
        exercise = None
        for belt in curriculum['belts']:
            for lesson_day in belt['days']:
                if lesson_day['day'] == day and 'exercise' in lesson_day:
                    exercise = lesson_day['exercise']
                    break
            if exercise:
                break
        
        if not exercise:
            return jsonify({
                'success': False,
                'message': f'No exercise found for day {day}',
                'output': 'Could not find the exercise for this day.'
            }), 404

        # Validate the code
        validation_result = validate_code(code, exercise)
        
        # Update user progress if successful
        if validation_result['success']:
            update_user_progress(1, day, True)  # Using default user_id 1 for now
            
        return jsonify({
            'success': validation_result['success'],
            'message': validation_result['message'],
            'output': validation_result['output']
        })

    except Exception as e:
        print(f"Error in validate_exercise: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'output': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/sensei-help', methods=['POST', 'OPTIONS'])
def get_sensei_help():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        code = data.get('code', '')
        context = data.get('context', '')
        question = data.get('question', '')
        current_day = data.get('currentDay', 1)
        current_belt = data.get('currentBelt', 'white')

        # Provide a helpful default response without using OpenAI
        response = (
            f"I'm here to help you with Day {current_day} of your {current_belt.capitalize()} Belt journey!\n\n"
            "Here are some general tips:\n"
            "1. Break down the problem into smaller steps\n"
            "2. Test your code frequently\n"
            "3. Use console.log() or print() to debug\n"
            "4. Check your syntax and indentation\n\n"
            "Feel free to ask specific questions about:\n"
            "- Code structure\n"
            "- Error messages\n"
            "- Best practices\n"
            "- Debugging techniques"
        )
        
        return jsonify({
            'success': True,
            'response': response
        })
        
    except Exception as e:
        app.logger.error(f"Error in sensei-help: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/execute', methods=['POST', 'OPTIONS'])
def execute_code():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({
                'success': False,
                'error': 'No code provided'
            }), 400

        code = data['code']
        
        # Create a temporary file to store the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
            
        try:
            # Run the code with a timeout
            result = subprocess.run(
                ['python', temp_file],
                capture_output=True,
                text=True,
                timeout=5  # 5 second timeout
            )
            
            return jsonify({
                'success': True,
                'output': result.stdout,
                'error': result.stderr
            })
            
        except subprocess.TimeoutExpired:
            return jsonify({
                'success': False,
                'error': 'Code execution timed out'
            }), 408
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
            
        finally:
            # Clean up the temporary file
            os.unlink(temp_file)
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def validate_code(code, exercise):
    try:
        # Create temp file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name
        
        # Run code
        process = subprocess.run(
            ['python', temp_file_path],
            capture_output=True,
            text=True
        )
        
        # Clean up
        os.unlink(temp_file_path)
        
        # Just check if the output contains the exact string we want
        success = "Hello, Python!" in process.stdout
        
        return {
            'success': success,
            'message': 'Great job!' if success else 'Try again!',
            'output': process.stdout
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e),
            'output': str(e)
        }

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000, host='0.0.0.0')
