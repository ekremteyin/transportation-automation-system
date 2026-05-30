import api from './axiosInstance';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const toggleUser = (id) => api.put(`/admin/users/${id}/toggle`);
export const getAdminAdverts = () => api.get('/admin/adverts');
export const deleteAdminAdvert = (id) => api.delete(`/admin/adverts/${id}`);
export const getComplaints = () => api.get('/admin/complaints');
export const resolveComplaint = (id, status) => api.put(`/admin/complaints/${id}/resolve`, { status });
