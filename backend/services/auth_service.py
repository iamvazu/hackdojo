"""Authentication service for HackDojo"""

import os
import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app
from datetime import datetime, timedelta
from models import db, User, ChildProfile
from config.auth_config import FIREBASE_CONFIG, JWT_CONFIG, ROLES, ROLE_PERMISSIONS
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            try:
                logger.info("Initializing Firebase Admin SDK...")
                private_key = os.getenv('FIREBASE_PRIVATE_KEY')
                if not private_key:
                    logger.error("FIREBASE_PRIVATE_KEY not found in environment variables")
                    raise ValueError("FIREBASE_PRIVATE_KEY not found")
                    
                cred = credentials.Certificate({
                    "type": FIREBASE_CONFIG['type'],
                    "project_id": FIREBASE_CONFIG['project_id'],
                    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                    "private_key": private_key.replace('\\\\n', '\\n'),
                    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                    "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                    "auth_uri": FIREBASE_CONFIG['auth_uri'],
                    "token_uri": FIREBASE_CONFIG['token_uri'],
                    "auth_provider_x509_cert_url": FIREBASE_CONFIG['auth_provider_x509_cert_url'],
                    "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_CERT_URL')
                })
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing Firebase Admin SDK: {str(e)}")
                raise

    def verify_firebase_token(self, id_token):
        """Verify Firebase ID token and return user info"""
        try:
            logger.info("Verifying Firebase token...")
            decoded_token = auth.verify_id_token(id_token)
            logger.info(f"Token verified for user: {decoded_token.get('email')}")
            return decoded_token
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None

    def create_or_update_user(self, user_data, auth_provider='email'):
        """Create or update user in database"""
        try:
            logger.info(f"Creating/updating user: {user_data.get('email')}")
            email = user_data.get('email')
            user = User.query.filter_by(email=email).first()
            
            if not user:
                logger.info("Creating new user")
                user = User(
                    email=email,
                    role=user_data.get('role', ROLES['STUDENT']),
                    auth_provider=auth_provider,
                    firebase_uid=user_data.get('firebase_uid'),
                    created_at=datetime.utcnow()
                )
                db.session.add(user)
            else:
                logger.info("Updating existing user")
                user.auth_provider = auth_provider
                user.firebase_uid = user_data.get('firebase_uid')
                user.last_login = datetime.utcnow()
            
            db.session.commit()
            logger.info(f"User saved successfully: {user.email}")
            return user
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            db.session.rollback()
            return None

    def get_user_permissions(self, role):
        """Get permissions for a given role"""
        return ROLE_PERMISSIONS.get(role, [])

    def create_child_profile(self, parent_id, child_data):
        """Create a child profile linked to parent"""
        try:
            logger.info(f"Creating child profile for parent: {parent_id}")
            child = ChildProfile(
                parent_id=parent_id,
                name=child_data['name'],
                age=child_data.get('age'),
                grade=child_data.get('grade'),
                created_at=datetime.utcnow()
            )
            db.session.add(child)
            db.session.commit()
            logger.info(f"Child profile created successfully: {child.name}")
            return child
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            db.session.rollback()
            return None

    def link_social_account(self, user_id, provider_data):
        """Link social account to existing user"""
        try:
            logger.info(f"Linking social account for user: {user_id}")
            user = User.query.get(user_id)
            if user:
                user.social_accounts = user.social_accounts or {}
                user.social_accounts[provider_data['provider']] = provider_data['id']
                db.session.commit()
                logger.info(f"Social account linked successfully: {provider_data['provider']}")
                return True
            return False
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            db.session.rollback()
            return False
