import api from './axiosInstance';

export const createOffer = (data) => api.post('/offers', data);
export const getAdvertOffers = (advertId) => api.get(`/adverts/${advertId}/offers`);
export const getMyOffers = () => api.get('/offers/my');
export const acceptOffer = (id) => api.put(`/offers/${id}/accept`);
export const rejectOffer = (id) => api.put(`/offers/${id}/reject`);
export const updateAdvertStatus = (advertId, status) =>
  api.put(`/adverts/${advertId}/status`, { status });
export const getCarrierStats = () => api.get('/offers/carrier-stats');
