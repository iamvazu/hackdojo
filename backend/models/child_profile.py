from . import db
from datetime import datetime

class ChildProfile(db.Model):
    __tablename__ = 'child_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    parent = db.relationship('User', backref=db.backref('children', lazy=True))
    
    def __repr__(self):
        return f'<ChildProfile {self.name}>'
