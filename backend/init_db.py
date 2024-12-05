from app import app, db
from models import User, Progress
from werkzeug.security import generate_password_hash

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create demo accounts if they don't exist
        demo_accounts = [
            {
                'email': 'student@hackdojo.com',
                'password': 'student123',
                'role': 'student'
            },
            {
                'email': 'parent@hackdojo.com',
                'password': 'parent123',
                'role': 'parent'
            },
            {
                'email': 'admin@hackdojo.com',
                'password': 'admin123',
                'role': 'admin'
            }
        ]
        
        for account in demo_accounts:
            if not User.query.filter_by(email=account['email']).first():
                user = User(
                    email=account['email'],
                    password_hash=generate_password_hash(account['password']),
                    role=account['role']
                )
                db.session.add(user)
                
                # Create initial progress for student
                if account['role'] == 'student':
                    progress = Progress(
                        user_id=user.id,
                        current_belt='white',
                        current_day=1,
                        completed_lessons=[]
                    )
                    db.session.add(progress)
        
        db.session.commit()
        print("Database initialized successfully with demo accounts!")

if __name__ == '__main__':
    init_database()
