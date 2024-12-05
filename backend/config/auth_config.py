"""Authentication configuration for HackDojo"""

# Firebase Admin SDK Configuration
FIREBASE_CONFIG = {
    'type': 'service_account',
    'project_id': 'hackdojo-dev',
    'private_key_id': '',  # Set via environment variable
    'private_key': '',     # Set via environment variable
    'client_email': '',    # Set via environment variable
    'client_id': '',       # Set via environment variable
    'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
    'token_uri': 'https://oauth2.googleapis.com/token',
    'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
    'client_x509_cert_url': '' # Set via environment variable
}

# JWT Configuration
JWT_CONFIG = {
    'SECRET_KEY': '',  # Set via environment variable
    'ACCESS_TOKEN_EXPIRES': 3600,  # 1 hour
    'REFRESH_TOKEN_EXPIRES': 2592000,  # 30 days
}

# Role Configuration
ROLES = {
    'STUDENT': 'student',
    'PARENT': 'parent',
    'ADMIN': 'admin',
}

# Role Permissions
ROLE_PERMISSIONS = {
    'student': [
        'view_lessons',
        'submit_code',
        'view_progress',
        'participate_challenges',
    ],
    'parent': [
        'view_child_progress',
        'manage_child_account',
        'view_reports',
    ],
    'admin': [
        'manage_users',
        'manage_content',
        'view_analytics',
        'manage_challenges',
    ]
}
