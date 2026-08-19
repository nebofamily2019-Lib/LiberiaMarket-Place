import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface ReportData {
  reported_user_id?: string;
  product_id?: string;
  reason: 'scam' | 'harassment' | 'inappropriate_content' | 'counterfeit' | 'other';
  description?: string;
}

export const reportService = {
  // Submit a report
  createReport: async (data: ReportData) => {
    const response = await api.post('/reports', data);
    return response.data;
  }
};
