import api from '../utils/api';

export interface MobileMoneyAccount {
  id: string;
  provider: 'orange_money' | 'mtn_mobile_money' | 'lonestar_money';
  phone_number: string;
  account_name: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
}

export const mobileMoneyService = {
  // Get all accounts
  getAccounts: async () => {
    const response = await api.get('/mobile-money/accounts');
    return response.data;
  },

  // Add new account
  addAccount: async (data: { provider: string; phone_number: string; account_name: string }) => {
    const response = await api.post('/mobile-money/accounts', data);
    return response.data;
  },

  // Set as primary
  setPrimary: async (id: string) => {
    const response = await api.put(`/mobile-money/accounts/${id}/primary`);
    return response.data;
  },

  // Delete account
  deleteAccount: async (id: string) => {
    const response = await api.delete(`/mobile-money/accounts/${id}`);
    return response.data;
  }
};
