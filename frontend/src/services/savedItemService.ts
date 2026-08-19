import api from '../utils/api';

export const savedItemService = {
  // Toggle saved status
  toggleSavedItem: async (productId: string) => {
    const response = await api.post(`/saved-items/${productId}`);
    return response.data;
  },

  // Get saved items
  getSavedItems: async (page = 1, limit = 20) => {
    const response = await api.get(`/saved-items?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Check if item is saved
  checkSavedStatus: async (productId: string) => {
    const response = await api.get(`/saved-items/${productId}/check`);
    return response.data;
  }
};
