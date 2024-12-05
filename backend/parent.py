from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, ChildProfile, Progress, Badge, Notification
from datetime import datetime, timedelta

parent_bp = Blueprint('parent', __name__)

@parent_bp.route('/children', methods=['GET'])
@jwt_required()
def get_children():
    try:
        parent_id = get_jwt_identity()
        parent = User.query.get(parent_id)
        
        if not parent or parent.role != 'parent':
            return jsonify({'error': 'Unauthorized access'}), 403
            
        children = ChildProfile.query.filter_by(parent_id=parent_id).all()
        return jsonify({
            'children': [{
                'id': child.id,
                'name': child.name,
                'belt_level': child.belt_level,
                'created_at': child.created_at.isoformat()
            } for child in children]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@parent_bp.route('/children/<int:child_id>/progress', methods=['GET'])
@jwt_required()
def get_child_progress(child_id):
    try:
        parent_id = get_jwt_identity()
        child = ChildProfile.query.filter_by(id=child_id, parent_id=parent_id).first()
        
        if not child:
            return jsonify({'error': 'Child not found or unauthorized access'}), 404
            
        # Get progress data
        progress = Progress.query.filter_by(child_id=child_id).all()
        badges = Badge.query.filter_by(child_id=child_id).all()
        
        return jsonify({
            'child': {
                'name': child.name,
                'belt_level': child.belt_level
            },
            'progress': [{
                'lesson_id': p.lesson_id,
                'completed': p.completed,
                'completed_at': p.completed_at.isoformat() if p.completed_at else None,
                'score': p.score
            } for p in progress],
            'badges': [{
                'name': b.name,
                'description': b.description,
                'earned_at': b.earned_at.isoformat()
            } for b in badges]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@parent_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        parent_id = get_jwt_identity()
        notifications = Notification.query.filter_by(
            parent_id=parent_id
        ).order_by(
            Notification.created_at.desc()
        ).all()
        
        return jsonify({
            'notifications': [{
                'id': n.id,
                'message': n.message,
                'read': n.read,
                'created_at': n.created_at.isoformat()
            } for n in notifications]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@parent_bp.route('/notifications/mark-read', methods=['POST'])
@jwt_required()
def mark_notifications_read():
    try:
        parent_id = get_jwt_identity()
        notification_ids = request.json.get('notification_ids', [])
        
        Notification.query.filter(
            Notification.id.in_(notification_ids),
            Notification.parent_id == parent_id
        ).update({Notification.read: True}, synchronize_session=False)
        
        db.session.commit()
        return jsonify({'message': 'Notifications marked as read'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@parent_bp.route('/reports/<int:child_id>', methods=['GET'])
@jwt_required()
def get_child_report(child_id):
    try:
        parent_id = get_jwt_identity()
        child = ChildProfile.query.filter_by(id=child_id, parent_id=parent_id).first()
        
        if not child:
            return jsonify({'error': 'Child not found or unauthorized access'}), 404
            
        # Get timeframe from query parameters (default to last 30 days)
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get progress data for the timeframe
        progress = Progress.query.filter(
            Progress.child_id == child_id,
            Progress.completed_at >= start_date
        ).all()
        
        # Get badges earned in the timeframe
        badges = Badge.query.filter(
            Badge.child_id == child_id,
            Badge.earned_at >= start_date
        ).all()
        
        return jsonify({
            'child': {
                'name': child.name,
                'belt_level': child.belt_level
            },
            'timeframe': {
                'start_date': start_date.isoformat(),
                'end_date': datetime.utcnow().isoformat()
            },
            'progress': {
                'completed_lessons': len([p for p in progress if p.completed]),
                'average_score': sum(p.score or 0 for p in progress) / len(progress) if progress else 0,
                'lessons': [{
                    'lesson_id': p.lesson_id,
                    'completed_at': p.completed_at.isoformat() if p.completed_at else None,
                    'score': p.score
                } for p in progress]
            },
            'badges': [{
                'name': b.name,
                'description': b.description,
                'earned_at': b.earned_at.isoformat()
            } for b in badges]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
