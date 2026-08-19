import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SellerDashboard from './SellerDashboard';

// Mock the API
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../utils/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

// Mock AuthContext
const mockUser = {
  id: 'seller-123',
  name: 'Test Seller',
  email: 'seller@test.com',
  role: 'seller',
  phone: '0777000000'
};

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: mockUser,
      isAuthenticated: true,
      loading: false
    })
  };
});

// Mock OfferService
vi.mock('../services/offerService', () => ({
  getReceivedOffers: vi.fn().mockResolvedValue([])
}));

describe('SellerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful responses
    mockGet.mockImplementation((url) => {
      if (url === '/products/stats/seller') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              totalRevenue: 5000,
              totalItemsSold: 10,
              activeListings: 5,
              recentSales: []
            }
          }
        });
      }
      if (url.includes('/products/user/')) {
        return Promise.resolve({
          data: {
            success: true,
            data: []
          }
        });
      }
      return Promise.resolve({ data: { success: false } });
    });
  });

  it('renders the dashboard and fetches stats', async () => {
    render(
      <BrowserRouter>
        <SellerDashboard />
      </BrowserRouter>
    );

    // Should show loading initially (or resolve quickly)
    // Wait for the dashboard content
    await waitFor(() => {
      expect(screen.getByText(/My Market Stand/i)).toBeInTheDocument();
    });

    // Check if stats are displayed
    expect(screen.getByText('Money Made')).toBeInTheDocument();
    expect(screen.getByText('Goods Sold')).toBeInTheDocument();
    
    // Check if API was called
    expect(mockGet).toHaveBeenCalledWith('/products/stats/seller');
  });

  it('displays user name', async () => {
    render(
      <BrowserRouter>
        <SellerDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hello, Test Seller!/i)).toBeInTheDocument();
    });
  });
});
