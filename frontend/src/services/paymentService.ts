import api from '../utils/api';

export interface Payment {
  id: string;
  offer_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: 'USD' | 'LRD';
  payment_method: 'orange_money' | 'mtn_mobile_money' | 'lonestar_money' | 'cash' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface InitiatePaymentData {
  offer_id: string;
  payment_method: string;
  mobile_money_account_id?: string;
  currency: 'USD' | 'LRD';
}

export const initiatePayment = async (data: InitiatePaymentData): Promise<Payment> => {
  const response = await api.post('/payments/initiate', data);
  return response.data.payment;
};

export const getMyPayments = async () => {
  const response = await api.get('/payments/my-payments');
  return response.data.data;
};

export const getMobileMoneyAccounts = async () => {
  const response = await api.get('/mobile-money');
  return response.data.data;
};
