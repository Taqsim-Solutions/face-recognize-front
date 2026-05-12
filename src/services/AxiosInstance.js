import axios from 'axios';
import settings from '../settings/settings';

const axiosInstance = axios.create({
    baseURL: settings.baseURL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
