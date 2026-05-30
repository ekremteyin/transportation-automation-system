import api from './axiosInstance';

export const createAdvert = (data) => api.post('/adverts', data);
export const getMyAdverts = () => api.get('/adverts/my');
export const getAdvertById = (id) => api.get(`/adverts/${id}`);
export const updateAdvert = (id, data) => api.put(`/adverts/${id}`, data);
export const deleteAdvert = (id) => api.delete(`/adverts/${id}`);
export const getOpenAdverts = (params) => api.get('/adverts/open', { params });
