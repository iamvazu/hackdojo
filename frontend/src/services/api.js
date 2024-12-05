const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const api = {
    // Auth endpoints
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return response.json();
    },

    // Student endpoints
    getStudentDashboard: async () => {
        const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getStudentProgress: async () => {
        const response = await fetch(`${API_BASE_URL}/student/progress`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    updateProgress: async (data) => {
        const response = await fetch(`${API_BASE_URL}/student/progress/update`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Curriculum endpoints
    getCurriculum: async () => {
        const response = await fetch(`${API_BASE_URL}/curriculum`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getLesson: async (day) => {
        const response = await fetch(`${API_BASE_URL}/lesson/${day}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Error handler wrapper
    handleApiError: (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw error;
    }
};

// Utility function to wrap API calls with error handling
export const withErrorHandling = (apiCall) => {
    return async (...args) => {
        try {
            return await apiCall(...args);
        } catch (error) {
            return api.handleApiError(error);
        }
    };
};

// Export wrapped versions of all API calls
export default {
    login: withErrorHandling(api.login),
    getStudentDashboard: withErrorHandling(api.getStudentDashboard),
    getStudentProgress: withErrorHandling(api.getStudentProgress),
    updateProgress: withErrorHandling(api.updateProgress),
    getCurriculum: withErrorHandling(api.getCurriculum),
    getLesson: withErrorHandling(api.getLesson)
};
