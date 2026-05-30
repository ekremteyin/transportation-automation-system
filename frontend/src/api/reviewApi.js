import api from './axiosInstance';

export const createReview = (data) => api.post('/reviews', data);
export const getUserReviews = (userId) => api.get(`/users/${userId}/reviews`);
