import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import MakeOfferModal from './MakeOfferModal'
import * as offerService from '../services/offerService'

// Mock dependencies
vi.mock('../services/offerService', () => ({
  createOffer: vi.fn()
}))

// Mock ToastContext
const mockToast = {
  success: vi.fn(),
  error: vi.fn()
}
vi.mock('../context/ToastContext', () => ({
  useToast: () => mockToast
}))

describe('MakeOfferModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()
  const defaultProps = {
    productId: '123',
    productTitle: 'Test Product',
    productPrice: 100,
    productCurrency: 'USD',
    onClose: mockOnClose,
    onSuccess: mockOnSuccess
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<MakeOfferModal {...defaultProps} />)
    expect(screen.getByText('🤝 Make an Offer')).toBeInTheDocument()
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText(/Asking Price:/)).toBeInTheDocument()
  })

  it('detects USD currency correctly', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    await user.type(input, '50')
    
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('detects LRD currency correctly', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    await user.type(input, 'L$500')
    
    expect(screen.getByText('LRD')).toBeInTheDocument()
  })

  it('submits offer successfully', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    await user.type(input, '150')
    
    const messageInput = screen.getByPlaceholderText(/Add a note/i)
    await user.type(messageInput, 'I really want this!')

    const submitBtn = screen.getByRole('button', { name: /Send Offer/i })
    await user.click(submitBtn)
    
    expect(offerService.createOffer).toHaveBeenCalledWith({
      product_id: '123',
      offer_amount: 150,
      currency: 'USD',
      message: 'I really want this!'
    })
    expect(mockToast.success).toHaveBeenCalled()
    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('allows offers lower than asking price (negotiation)', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    await user.type(input, '50') // Lower than 100
    
    const submitBtn = screen.getByRole('button', { name: /Send Offer/i })
    await user.click(submitBtn)
    
    expect(offerService.createOffer).toHaveBeenCalledWith({
      product_id: '123',
      offer_amount: 50,
      currency: 'USD',
      message: ''
    })
    expect(mockToast.success).toHaveBeenCalled()
  })

  it('validates empty input', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const submitBtn = screen.getByRole('button', { name: /Send Offer/i })
    await user.click(submitBtn)
    
    // Because of 'required' attribute, handleSubmit is not called
    expect(offerService.createOffer).not.toHaveBeenCalled()
    
    // The input should be invalid
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    expect(input).toBeInvalid()
  })

  it('validates invalid number input', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    await user.type(input, 'abc')
    
    const submitBtn = screen.getByRole('button', { name: /Send Offer/i })
    await user.click(submitBtn)
    
    expect(mockToast.error).toHaveBeenCalledWith('Please enter a valid offer amount')
    expect(offerService.createOffer).not.toHaveBeenCalled()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    // Mock API error
    vi.mocked(offerService.createOffer).mockRejectedValueOnce({
      response: { data: { error: 'You already have an active offer' } }
    })

    render(<MakeOfferModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    await user.type(input, '100')
    
    const submitBtn = screen.getByRole('button', { name: /Send Offer/i })
    await user.click(submitBtn)
    
    expect(offerService.createOffer).toHaveBeenCalled()
    expect(mockToast.error).toHaveBeenCalledWith('You already have an active offer')
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('handles generic API errors', async () => {
    const user = userEvent.setup()
    // Mock generic error
    vi.mocked(offerService.createOffer).mockRejectedValueOnce(new Error('Network Error'))

    render(<MakeOfferModal {...defaultProps} />)
    
    const input = screen.getByPlaceholderText(/e.g., \$50 or 500 LRD/i)
    await user.type(input, '100')
    
    const submitBtn = screen.getByRole('button', { name: /Send Offer/i })
    await user.click(submitBtn)
    
    expect(mockToast.error).toHaveBeenCalledWith('Failed to send offer. Please try again.')
  })

  it('closes when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelBtn)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes when close icon is clicked', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const closeIcon = screen.getByRole('button', { name: /×/i })
    await user.click(closeIcon)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes when clicking overlay', async () => {
    const user = userEvent.setup()
    const { container } = render(<MakeOfferModal {...defaultProps} />)
    
    // Click the overlay (the outermost div)
    const overlay = container.firstChild as HTMLElement
    await user.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('does not close when clicking modal content', async () => {
    const user = userEvent.setup()
    render(<MakeOfferModal {...defaultProps} />)
    
    const modalContent = screen.getByText('🤝 Make an Offer').closest('.modal-content')
    if (modalContent) {
      await user.click(modalContent)
    }
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
