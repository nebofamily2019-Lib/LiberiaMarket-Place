import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';

// Mock API
const mockGet = vi.fn();
vi.mock('../utils/api', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args)
  }
}));

// Mock SavedItemService
vi.mock('../services/savedItemService', () => ({
  savedItemService: {
    checkSavedStatus: vi.fn().mockResolvedValue({ isSaved: false }),
    toggleSavedItem: vi.fn()
  }
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API responses
    mockGet.mockImplementation((url) => {
      if (url.includes('/products')) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: '1',
                title: 'Test Product',
                price: 100,
                currency: 'USD',
                location: 'Monrovia',
                images: ['test.jpg'],
                category: { name: 'Electronics', icon: '📱', color: '#000' },
                seller: { name: 'Seller 1' },
                status: 'active',
                createdAt: new Date().toISOString()
              }
            ]
          }
        });
      }
      if (url === '/categories') {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              { id: 'cat1', name: 'Electronics', icon: '📱', color: '#000' }
            ]
          }
        });
      }
      return Promise.resolve({ data: { success: false } });
    });
  });

  it('renders the home page and fetches products', async () => {
    render(
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    );

    // Check for main elements
    // The real translation for heroTitle is likely "Liberia Market" or similar
    // We can check for something we know exists in the real translation
    expect(screen.getByText(/Liberia Market/i)).toBeInTheDocument();
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Check if API was called
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/products'));
  });
});
