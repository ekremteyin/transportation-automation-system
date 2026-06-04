import api from './axiosInstance';

export const getConversations  = ()           => api.get('/messages/conversations');
export const getMessages       = (offerId)    => api.get(`/messages/offer/${offerId}`);
export const sendMessage       = (dto)        => api.post('/messages', dto);
export const markRead          = (offerId)    => api.put(`/messages/offer/${offerId}/read`);
export const getUnreadCount    = ()           => api.get('/messages/unread-count');
