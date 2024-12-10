from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    children = db.relationship('ChildProfile', backref='parent', lazy=True)
    progress = db.relationship('Progress', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

class ChildProfile(db.Model):
    __tablename__ = 'child_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    belt_level = db.Column(db.String(50), default='white')
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    badges = db.relationship('Badge', backref='child', lazy=True)

class Belt(db.Model):
    __tablename__ = 'belts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    start_day = db.Column(db.Integer, nullable=False)
    days_required = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.relationship('Progress', backref='belt', lazy=True)

    def __repr__(self):
        return f'<Belt {self.name}>'

class Progress(db.Model):
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    current_day = db.Column(db.Integer, default=1)
    current_belt_id = db.Column(db.Integer, db.ForeignKey('belts.id'), default=1)
    completed_days = db.Column(db.Text, default='[]')

    def __repr__(self):
        return f'<Progress user_id={self.user_id} day={self.current_day}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'current_day': self.current_day,
            'current_belt_id': self.current_belt_id,
            'completed_days': json.loads(self.completed_days) if self.completed_days else []
        }

class Badge(db.Model):
    __tablename__ = 'badges'
    
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child_profiles.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

def create_demo_accounts():
    try:
        # Create initial belts
        if Belt.query.count() == 0:
            belts = [
                Belt(
                    name='White Belt',
                    color='#FFFFFF',
                    start_day=1,
                    days_required=10,
                    description='Python Basics - Variables, Data Types, and Basic Operations'
                ),
                Belt(
                    name='Yellow Belt',
                    color='#FFD700',
                    start_day=11,
                    days_required=10,
                    description='Control Flow and Functions'
                ),
                Belt(
                    name='Orange Belt',
                    color='#FFA500',
                    start_day=21,
                    days_required=10,
                    description='Data Structures and Algorithms'
                ),
                Belt(
                    name='Green Belt',
                    color='#008000',
                    start_day=31,
                    days_required=10,
                    description='Object-Oriented Programming'
                ),
                Belt(
                    name='Blue Belt',
                    color='#0000FF',
                    start_day=41,
                    days_required=10,
                    description='File I/O and Error Handling'
                ),
                Belt(
                    name='Brown Belt',
                    color='#8B4513',
                    start_day=51,
                    days_required=10,
                    description='Modules and Packages'
                ),
                Belt(
                    name='Red Belt',
                    color='#FF0000',
                    start_day=61,
                    days_required=10,
                    description='Web Development with Flask'
                ),
                Belt(
                    name='Black Belt',
                    color='#000000',
                    start_day=71,
                    days_required=30,
                    description='Advanced Python and Projects'
                )
            ]
            
            for belt in belts:
                db.session.add(belt)
            db.session.commit()

        # Create roles if they don't exist
        roles = ['admin', 'parent', 'student']
        for role_name in roles:
            role = Role.query.filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name)
                db.session.add(role)
        db.session.commit()

        # Create demo admin
        admin = User.query.filter_by(email='admin@hackdojo.com').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@hackdojo.com',
                password_hash='pbkdf2:sha256:260000$1GvmeoAkcWB1Zk5u$4742aa0b37e944b89cdc2c0a85b4705e8f9ebf3e77f42c340e83c7834778c2ac',  # password: admin123
                role='admin'
            )
            db.session.add(admin)

        # Create demo parent
        parent = User.query.filter_by(email='parent@example.com').first()
        if not parent:
            parent = User(
                username='demoparent',
                email='parent@example.com',
                password_hash='pbkdf2:sha256:260000$1GvmeoAkcWB1Zk5u$4742aa0b37e944b89cdc2c0a85b4705e8f9ebf3e77f42c340e83c7834778c2ac',  # password: admin123
                role='parent'
            )
            db.session.add(parent)

        # Create demo student
        student = User.query.filter_by(email='student@example.com').first()
        if not student:
            student = User(
                username='demostudent',
                email='student@example.com',
                password_hash='pbkdf2:sha256:260000$1GvmeoAkcWB1Zk5u$4742aa0b37e944b89cdc2c0a85b4705e8f9ebf3e77f42c340e83c7834778c2ac',  # password: admin123
                role='student'
            )
            db.session.add(student)
            db.session.commit()

            # Create initial progress for demo student
            white_belt = Belt.query.filter_by(name='White Belt').first()
            if white_belt:
                progress = Progress(
                    user_id=student.id,
                    current_belt_id=white_belt.id,
                    current_day=1,
                    completed_days=[]
                )
                db.session.add(progress)

        db.session.commit()
        print("Demo accounts created successfully")

    except Exception as e:
        print(f"Error creating demo accounts: {str(e)}")
        db.session.rollback()

# Helper function to initialize the database and create initial belts
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
        
        # Create initial belts if they don't exist
        if Belt.query.count() == 0:
            belts = [
                Belt(
                    name='White Belt',
                    color='#FFFFFF',
                    start_day=1,
                    days_required=10,
                    description='Python Basics - Variables, Data Types, and Basic Operations'
                ),
                Belt(
                    name='Yellow Belt',
                    color='#FFD700',
                    start_day=11,
                    days_required=10,
                    description='Control Flow and Functions'
                ),
                Belt(
                    name='Orange Belt',
                    color='#FFA500',
                    start_day=21,
                    days_required=10,
                    description='Data Structures and Algorithms'
                ),
                Belt(
                    name='Green Belt',
                    color='#008000',
                    start_day=31,
                    days_required=10,
                    description='Object-Oriented Programming'
                ),
                Belt(
                    name='Blue Belt',
                    color='#0000FF',
                    start_day=41,
                    days_required=10,
                    description='File I/O and Error Handling'
                ),
                Belt(
                    name='Brown Belt',
                    color='#8B4513',
                    start_day=51,
                    days_required=10,
                    description='Modules and Packages'
                ),
                Belt(
                    name='Red Belt',
                    color='#FF0000',
                    start_day=61,
                    days_required=10,
                    description='Web Development with Flask'
                ),
                Belt(
                    name='Black Belt',
                    color='#000000',
                    start_day=71,
                    days_required=30,
                    description='Advanced Python and Projects'
                )
            ]
            
            for belt in belts:
                db.session.add(belt)
            
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Error creating initial belts: {str(e)}")
