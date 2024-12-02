from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='parent')  # 'parent' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    children = db.relationship('ChildProfile', backref='parent', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class ChildProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    school = db.Column(db.String(100))
    goals = db.Column(db.Text)
    dreams = db.Column(db.Text)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.relationship('Progress', backref='child', lazy=True)

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child_profile.id'), nullable=False)
    week = db.Column(db.String(20), nullable=False)  # e.g., 'week_1'
    day = db.Column(db.Integer, nullable=False)  # e.g., 1
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    code_submission = db.Column(db.Text)
    points_earned = db.Column(db.Integer, default=0)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child_profile.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    badge_image = db.Column(db.String(255))  # URL to badge image
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper function to initialize the database
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
