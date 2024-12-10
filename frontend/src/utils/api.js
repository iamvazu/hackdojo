// api.js - Utility functions for API calls

export const API_BASE_URL = 'http://localhost:5000';

export const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const defaultOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    // If there's a body, add it
    if (options.body) {
      defaultOptions.body = JSON.stringify(options.body);
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, defaultOptions);
    
    // Handle response
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }

      // Create error with additional info
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const updateProgress = async (completedDay) => {
  try {
    const response = await fetchWithAuth('/api/progress/update', {
      method: 'POST',
      body: { completed_day: completedDay }
    });
    return response;
  } catch (error) {
    console.error('Failed to update progress:', error);
    throw error;
  }
};

export const fetchLesson = async (day) => {
  try {
    const response = await fetchWithAuth(`/api/lesson/${day}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch lesson:', error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await fetchWithAuth('/api/auth/refresh');
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};
