import api from '../utils/api';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';
export type ReportReason = 'scam' | 'harassment' | 'inappropriate_content' | 'counterfeit' | 'other';

export interface ReportUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface ReportProduct {
  id: string;
  title: string;
  status: string;
  images?: string[];
  seller_id: string;
}

export interface Report {
  id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  admin_notes?: string;
  createdAt: string;
  reporter: ReportUser | null;
  reportedUser: ReportUser | null;
  product: ReportProduct | null;
}

export interface ReportsParams {
  page?: number;
  limit?: number;
  status?: ReportStatus | 'all';
}

export interface ReportsResponse {
  success: boolean;
  count: number;
  totalPages: number;
  currentPage: number;
  data: Report[];
}

export const getReports = async (params: ReportsParams = {}): Promise<ReportsResponse> => {
  const response = await api.get('/admin/reports', { params });
  return response.data;
};

export const updateReportStatus = async (id: string, status: ReportStatus, admin_notes?: string): Promise<Report> => {
  const response = await api.patch(`/admin/reports/${id}`, { status, admin_notes });
  return response.data.data;
};

export const suspendUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/suspend`);
};

export const reactivateUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/reactivate`);
};

export interface ListingSeller {
  id: string;
  name: string;
  phone?: string;
  isActive: boolean;
}

export interface ListingCategory {
  id: string;
  name: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'sold' | 'inactive' | 'pending';
  images?: string[];
  views: number;
  created_at: string;
  seller: ListingSeller | null;
  category: ListingCategory | null;
}

export interface ListingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Listing['status'] | 'all';
  sellerSearch?: string;
}

export interface ListingsResponse {
  success: boolean;
  count: number;
  totalPages: number;
  currentPage: number;
  data: Listing[];
}

export const getListings = async (params: ListingsParams = {}): Promise<ListingsResponse> => {
  const response = await api.get('/admin/listings', { params });
  return response.data;
};
