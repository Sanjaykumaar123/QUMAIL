import axios from 'axios';

// Dynamically use the production URL from Vercel env, or fallback to local dev server
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('qumail_token');
    const agent = localStorage.getItem('qumail_agent');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (agent) {
        config.headers['X-Agent-Email'] = agent;
    }
    return config;
});

export const sendOtp = async (email) => {
    const response = await api.post('/send-otp', { email });
    return response.data;
};

export const verifyOtp = async (email, otp) => {
    const response = await api.post('/verify-otp', { email, otp });
    return response.data;
};

export const googleLogin = async (credentials) => {
    const response = await api.post('/google-login', credentials);
    return response.data;
};

export const fetchAIRecommendation = async (body, recipient) => {
    const response = await api.post('/ai/recommend', { body, recipient });
    return response.data;
};

export const sendEncryptedEmail = async (payload) => {
    const response = await api.post('/email/send', payload);
    return response.data;
};

export const getInbox = async () => {
    const response = await api.get('/email/inbox');
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get('/security/dashboard');
    return response.data;
};

export default api;
