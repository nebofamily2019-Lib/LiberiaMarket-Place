import api from '../utils/api';

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
