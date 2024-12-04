from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import subprocess
import os
import tempfile
import sqlite3
from datetime import datetime
import codecs

app = Flask(__name__)
CORS(app)

# Configure CORS for development
# CORS(app)  

@app.before_request
def before_request():
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response

@app.after_request
def after_request(response):
    response.headers['Content-Type'] = 'application/json'
    return response

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
        curriculum_path = os.path.join(os.path.dirname(__file__), 'curriculum.json')
        print(f"Loading curriculum from: {curriculum_path}")
        
        if not os.path.exists(curriculum_path):
            print("Error: curriculum.json not found")
            return {"belts": []}
            
        with codecs.open(curriculum_path, 'r', encoding='utf-8-sig') as f:
            curriculum = json.load(f)
            
        if not curriculum or not isinstance(curriculum, dict) or 'belts' not in curriculum:
            print("Error: Invalid curriculum format")
            return {"belts": []}
            
        print(f"Successfully loaded curriculum with {len(curriculum['belts'])} belts")
        return curriculum
    except json.JSONDecodeError as e:
        print(f"Error decoding curriculum.json: {str(e)}")
        return {"belts": []}
    except Exception as e:
        print(f"Unexpected error loading curriculum: {str(e)}")
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

def load_progress():
    try:
        with open('progress.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading progress: {e}")
        return {
            "currentBelt": "white",
            "currentDay": 1,
            "completedDays": [],
            "lastUpdated": ""
        }

def save_progress(progress_data):
    try:
        progress_data['lastUpdated'] = datetime.now().isoformat()
        with open('progress.json', 'w', encoding='utf-8') as f:
            json.dump(progress_data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving progress: {e}")
        return False

@app.route('/api/curriculum', methods=['GET'])
def get_curriculum():
    try:
        curriculum = load_curriculum()
        return jsonify(curriculum)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lesson/<int:day>', methods=['GET'])
def get_lesson(day):
    try:
        curriculum = load_curriculum()
        if not curriculum:
            return jsonify({'error': 'Failed to load curriculum'}), 500

        # Find the belt and lesson for the given day
        for belt in curriculum['belts']:
            start_day = belt.get('startDay', 1)
            end_day = belt.get('endDay', belt['requiredDays'])
            
            if start_day <= day <= end_day:
                # Check if this day exists in the belt's days
                for lesson in belt.get('days', []):
                    if lesson['day'] == day:
                        return jsonify(lesson)
                
                # If day not found in belt's days, return a default lesson
                return jsonify({
                    'day': day,
                    'title': f'Day {day}',
                    'content': 'Lesson content coming soon!',
                    'exercise': {
                        'title': 'Practice Exercise',
                        'description': 'Try writing some Python code!',
                        'starterCode': '# Write your Python code here\nprint("Hello, World!")',
                        'hint': 'Start by using the print() function',
                        'test_cases': [
                            {
                                'input': '',
                                'expected': 'Hello, World!',
                                'description': 'Basic output test'
                            }
                        ]
                    }
                })

        return jsonify({'error': f'No lesson found for day {day}'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/progress', methods=['GET', 'POST'])
def handle_progress():
    if request.method == 'GET':
        progress = load_progress()
        return jsonify(progress)
    else:  # POST
        try:
            data = request.json
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            current_progress = load_progress()
            
            # Update completed days
            if 'completedDay' in data:
                completed_day = data['completedDay']
                if completed_day not in current_progress['completedDays']:
                    current_progress['completedDays'].append(completed_day)
                    current_progress['completedDays'].sort()
                
                # Update current day if necessary
                if completed_day >= current_progress['currentDay']:
                    current_progress['currentDay'] = completed_day + 1

                # Update belt if necessary
                curriculum = load_curriculum()
                if curriculum:
                    for belt in curriculum['belts']:
                        if belt['startDay'] <= current_progress['currentDay'] <= belt['endDay']:
                            current_progress['currentBelt'] = belt['name']
                            break

            if save_progress(current_progress):
                return jsonify(current_progress)
            else:
                return jsonify({'error': 'Failed to save progress'}), 500

        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/run', methods=['POST'])
def run_code():
    try:
        code = request.json.get('code', '')
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_path = f.name
        
        try:
            # Run the code and capture output
            result = subprocess.run(
                ['python', temp_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            output = result.stdout if result.returncode == 0 else result.stderr
        finally:
            # Clean up the temporary file
            os.unlink(temp_path)
        
        return jsonify({'output': output})
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out'}), 408
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/validate', methods=['POST'])
def validate_code():
    data = request.get_json()
    code = data.get('code', '')
    day = data.get('day')
    test_cases = data.get('test_cases', [])
    
    if not code or not day or not test_cases:
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        # Create a temporary file for the code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
            
        success = True
        message = ''
            
        # Run test cases
        for test_case in test_cases:
            # Execute the code with test input
            input_data = test_case.get('input', '')
            expected_output = test_case.get('expected', '').strip()
            
            # Run the code and capture output
            process = subprocess.run(
                ['python', temp_file],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=5
            )
            
            actual_output = process.stdout.strip()
            
            # Compare outputs
            if actual_output != expected_output:
                success = False
                message = f'Test case failed. Expected: {expected_output}, Got: {actual_output}'
                break
        
        # Clean up
        os.unlink(temp_file)
        
        # Update user progress if successful
        if success:
            user_id = 1  # Replace with actual user authentication
            update_user_progress(user_id, day, True)
        
        return jsonify({
            'success': success,
            'message': message or 'All test cases passed!'
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Code execution timed out'}), 408
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message')
    current_belt = data.get('currentBelt')
    current_day = data.get('currentDay')
    
    # Here you would integrate with your AI model for chat responses
    # For now, we'll return a simple response
    response = {
        'response': f"I see you're working on your {current_belt} belt, day {current_day}. How can I help you with your Python journey?"
    }
    
    return jsonify(response)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
