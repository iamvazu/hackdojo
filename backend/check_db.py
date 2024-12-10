from flask import Flask
from models import db, Belt, Progress, User
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hackdojo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    print("\nBelts:")
    belts = Belt.query.all()
    for belt in belts:
        print("ID:" + " " + str(belt.id))
        print("Name:" + " " + belt.name)
        print("Start Day:" + " " + str(belt.start_day))
        print("Days Required:" + " " + str(belt.days_required))
    
    print("\nUsers:")
    users = User.query.all()
    for user in users:
        print("ID:" + " " + str(user.id))
        print("Email:" + " " + user.email)
        
        print("\nProgress:")
        progress = Progress.query.filter_by(user_id=user.id).first()
        if progress:
            print("Current Day:" + " " + str(progress.current_day))
            print("Current Belt ID:" + " " + str(progress.current_belt_id))
            print("Completed Days:" + " " + str(progress.completed_days))
        else:
            print("No progress found for user")
