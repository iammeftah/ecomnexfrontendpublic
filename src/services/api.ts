import axios from 'axios';
import { authService } from './auth-service/authService';

// Create an axios instance with the correct base URL
const api = axios.create({
    baseURL: 'http://localhost:9090',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cross-origin requests with credentials
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Adding token to request:', `Bearer ${token.substring(0, 15)}...`);
        } else {
            console.warn('No token available for request to:', config.url);
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`Error response from ${error.config.url}:`, {
                status: error.response.status,
                data: error.response.data
            });

            // Handle 403 errors - might be due to expired token
            if (error.response.status === 403) {
                console.warn('Access forbidden - token might be expired');
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
