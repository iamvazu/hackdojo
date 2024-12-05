// api.js - Utility functions for API calls

export const API_BASE_URL = 'http://localhost:5000';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
  }
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const defaultOptions = {
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making request to:', url);
    console.log('With options:', JSON.stringify(mergedOptions, null, 2));

    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }

      if (response.status === 401) {
        // Clear token and redirect to login for auth failures
        localStorage.removeItem('token');
        console.error('Authentication failed:', errorMessage);
        window.location.href = '/login';
        throw new Error('Authentication failed: ' + errorMessage);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    // Re-throw the error to be handled by the component
    throw error;
  }
};
