// User roles and their permissions
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};

// Role-based permissions
export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_courses',
    'manage_content',
    'view_analytics',
    'manage_instructors',
    'manage_students',
    'manage_settings'
  ],
  [ROLES.INSTRUCTOR]: [
    'create_courses',
    'edit_own_courses',
    'view_student_progress',
    'grade_assignments'
  ],
  [ROLES.STUDENT]: [
    'view_courses',
    'submit_assignments',
    'view_own_progress'
  ]
};
