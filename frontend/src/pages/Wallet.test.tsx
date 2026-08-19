import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import Wallet from './Wallet'

// Mock ToastContext
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock services
vi.mock('../services/mobileMoneyService', () => ({
  mobileMoneyService: {
    getAccounts: vi.fn().mockResolvedValue({ success: true, data: [] }),
    addAccount: vi.fn().mockResolvedValue({ success: true }),
    deleteAccount: vi.fn().mockResolvedValue({ success: true }),
    setPrimary: vi.fn().mockResolvedValue({ success: true })
  }
}))

describe('Wallet Page', () => {
  it('renders wallet title', async () => {
    render(<Wallet />)
    expect(screen.getByText(/My Wallet/i)).toBeInTheDocument()
  })

  it('shows add account form when button is clicked', async () => {
    render(<Wallet />)
    
    const addButton = screen.getByText(/\+ Add Account/i)
    fireEvent.click(addButton)
    
    expect(screen.getByText(/Save Account/i)).toBeInTheDocument()
  })

  it('does not show voice input or emoji', async () => {
    render(<Wallet />)
    
    const addButton = screen.getByText(/\+ Add Account/i)
    fireEvent.click(addButton)
    
    // Check that the standard input is there
    const nameInput = screen.getByPlaceholderText('e.g. John Doe')
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.tagName).toBe('INPUT')
    
    // Check that emoji is gone
    const useNumberBtn = screen.queryByText(/📱/)
    expect(useNumberBtn).not.toBeInTheDocument()
  })
})
