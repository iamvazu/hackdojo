from . import db
from datetime import datetime

class Belt(db.Model):
    __tablename__ = 'belts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    belt_level = db.Column(db.String(50), nullable=False)  # e.g., 'white', 'yellow', 'green', etc.
    awarded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('belts', lazy=True))
    
    def __repr__(self):
        return f'<Belt {self.belt_level}>'
