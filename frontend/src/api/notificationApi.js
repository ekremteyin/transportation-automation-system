import api from './axiosInstance';

export const getMyNotifications = () => api.get('/notifications/my');
export const markAllRead        = () => api.put('/notifications/read-all');
