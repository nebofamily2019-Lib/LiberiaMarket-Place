import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test/test-utils'
import OfferCard from './OfferCard'
import * as offerService from '../services/offerService'
import { Offer } from '../services/offerService'

// Mock dependencies
vi.mock('../services/offerService', () => ({
  acceptOffer: vi.fn(),
  rejectOffer: vi.fn(),
  counterOffer: vi.fn(),
  getOfferStatusColor: vi.fn((status) => status === 'pending' ? 'orange' : 'gray'),
  getOfferStatusText: vi.fn((status) => status),
}))

// Mock ToastContext
const mockToast = {
  success: vi.fn(),
  error: vi.fn()
}
vi.mock('../context/ToastContext', () => ({
  useToast: () => mockToast
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('OfferCard', () => {
  const mockOnOfferUpdated = vi.fn()
  
  const mockProduct = {
    id: 'prod-1',
    title: 'Test Phone',
    price: 500,
    images: ['img1.jpg'],
    status: 'active'
  }

  const mockBuyer = {
    id: 'buyer-1',
    name: 'John Doe',
    phone: '0886123456'
  }

  const mockSeller = {
    id: 'seller-1',
    name: 'Jane Smith',
    phone: '0777123456'
  }

  const baseOffer: Offer = {
    id: 'offer-1',
    product_id: 'prod-1',
    buyer_id: 'buyer-1',
    seller_id: 'seller-1',
    offer_amount: 450,
    currency: 'USD',
    product_price_snapshot: 500,
    message: 'Can you do 450?',
    offer_count: 1,
    status: 'pending',
    seller_confirmed: false,
    buyer_confirmed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product: mockProduct,
    buyer: mockBuyer,
    seller: mockSeller
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders offer details correctly for seller', () => {
      render(<OfferCard offer={baseOffer} viewType="seller" />)
      
      expect(screen.getByText('Test Phone')).toBeInTheDocument()
      expect(screen.getByText('Buyer\'s Offer')).toBeInTheDocument()
      expect(screen.getByText('~$450.00')).toBeInTheDocument()
      expect(screen.getByText('Buyer\'s Message:')).toBeInTheDocument()
      expect(screen.getByText('Can you do 450?')).toBeInTheDocument()
      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
    })

    it('renders offer details correctly for buyer', () => {
      render(<OfferCard offer={baseOffer} viewType="buyer" />)
      
      expect(screen.getByText('Your Offer')).toBeInTheDocument()
      expect(screen.getByText('Your Message:')).toBeInTheDocument()
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
    })

    it('renders counter offer details when status is countered', () => {
      const counteredOffer: Offer = {
        ...baseOffer,
        status: 'countered',
        counter_amount: 480,
        counter_currency: 'USD',
        counter_message: 'Meet me in the middle'
      }

      render(<OfferCard offer={counteredOffer} viewType="buyer" />)
      
      expect(screen.getByText('Seller\'s Counter')).toBeInTheDocument()
      expect(screen.getByText('~$480.00')).toBeInTheDocument()
      expect(screen.getByText('Seller\'s Counter Message:')).toBeInTheDocument()
      expect(screen.getByText('Meet me in the middle')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('allows seller to accept pending offer', async () => {
      const user = userEvent.setup()
      render(<OfferCard offer={baseOffer} viewType="seller" onOfferUpdated={mockOnOfferUpdated} />)
      
      const acceptBtn = screen.getByRole('button', { name: /Accept/i })
      await user.click(acceptBtn)
      
      // Confirmation modal should appear
      expect(screen.getByText('Accept Offer?')).toBeInTheDocument()
      
      const confirmBtn = screen.getByRole('button', { name: 'Yes, Accept Offer' })
      await user.click(confirmBtn)
      
      expect(offerService.acceptOffer).toHaveBeenCalledWith('offer-1')
      expect(mockToast.success).toHaveBeenCalled()
      expect(mockOnOfferUpdated).toHaveBeenCalled()
    })

    it('allows seller to reject pending offer', async () => {
      const user = userEvent.setup()
      render(<OfferCard offer={baseOffer} viewType="seller" onOfferUpdated={mockOnOfferUpdated} />)
      
      const rejectBtn = screen.getByRole('button', { name: /Reject/i })
      await user.click(rejectBtn)
      
      // Confirmation modal should appear
      expect(screen.getByText('Reject Offer?')).toBeInTheDocument()
      
      const confirmBtn = screen.getByRole('button', { name: 'Yes, Reject Offer' })
      await user.click(confirmBtn)
      
      expect(offerService.rejectOffer).toHaveBeenCalledWith('offer-1')
      expect(mockToast.success).toHaveBeenCalled()
      expect(mockOnOfferUpdated).toHaveBeenCalled()
    })

    it('allows seller to counter pending offer', async () => {
      const user = userEvent.setup()
      render(<OfferCard offer={baseOffer} viewType="seller" onOfferUpdated={mockOnOfferUpdated} />)
      
      // Open counter form
      const counterBtn = screen.getByRole('button', { name: /Make Counter Offer/i })
      await user.click(counterBtn)
      
      expect(screen.getByText(/Propose a New Price/i)).toBeInTheDocument()
      
      // Fill form (input expects LRD)
      const amountInput = screen.getByLabelText(/Counter Amount/i)
      await user.type(amountInput, '90000') // Approx 473 USD
      
      const msgInput = screen.getByLabelText(/Message/i)
      await user.type(msgInput, 'Best I can do')
      
      // Submit
      const sendBtn = screen.getByRole('button', { name: 'Send Counter' })
      await user.click(sendBtn)
      
      expect(offerService.counterOffer).toHaveBeenCalledWith('offer-1', expect.objectContaining({
        counter_currency: 'USD',
        counter_message: 'Best I can do'
      }))
      expect(mockToast.success).toHaveBeenCalled()
      expect(mockOnOfferUpdated).toHaveBeenCalled()
    })

    it('allows buyer to accept counter offer', async () => {
      const counteredOffer: Offer = {
        ...baseOffer,
        status: 'countered',
        counter_amount: 480
      }
      const user = userEvent.setup()
      render(<OfferCard offer={counteredOffer} viewType="buyer" onOfferUpdated={mockOnOfferUpdated} />)
      
      const acceptBtn = screen.getByRole('button', { name: /Accept/i })
      await user.click(acceptBtn)
      
      const confirmBtn = screen.getByRole('button', { name: 'Yes, Accept Offer' })
      await user.click(confirmBtn)
      
      expect(offerService.acceptOffer).toHaveBeenCalledWith('offer-1')
    })

    it('shows offer-accepted payment-on-delivery reminder with seller phone (buyer view)', () => {
      const acceptedOffer: Offer = {
        ...baseOffer,
        status: 'accepted'
      }
      render(<OfferCard offer={acceptedOffer} viewType="buyer" />)

      expect(screen.getByText('Offer Accepted!')).toBeInTheDocument()
      expect(screen.getByText(/Payment happens on delivery/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: baseOffer.seller!.phone })).toHaveAttribute(
        'href',
        `tel:${baseOffer.seller!.phone}`
      )
    })

    it('validates counter offer amount', async () => {
      const user = userEvent.setup()
      render(<OfferCard offer={baseOffer} viewType="seller" />)
      
      // Open counter form
      await user.click(screen.getByRole('button', { name: /Make Counter Offer/i }))
      
      // Type invalid amount
      const input = screen.getByLabelText(/Counter Amount/i)
      await user.type(input, 'abc')
      
      await user.click(screen.getByRole('button', { name: /Send Counter/i }))
      
      // Because of 'required' attribute, handleSubmit is not called
      expect(input).toBeInvalid()
    })

    it('shows offer-accepted payment-on-delivery reminder with buyer phone (seller view)', () => {
      const acceptedOffer: Offer = { ...baseOffer, status: 'accepted' }
      render(<OfferCard offer={acceptedOffer} viewType="seller" />)

      expect(screen.getByText('Offer Accepted!')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: baseOffer.buyer!.phone })).toHaveAttribute(
        'href',
        `tel:${baseOffer.buyer!.phone}`
      )
    })

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup()
      vi.mocked(offerService.acceptOffer).mockRejectedValueOnce({
        response: { data: { error: 'Failed to accept' } }
      })

      render(<OfferCard offer={baseOffer} viewType="seller" />)
      
      const acceptBtn = screen.getByRole('button', { name: /Accept/i })
      await user.click(acceptBtn)
      
      const confirmBtn = screen.getByRole('button', { name: 'Yes, Accept Offer' })
      await user.click(confirmBtn)
      
      expect(mockToast.error).toHaveBeenCalledWith('Failed to accept')
    })

    it('handles reject API errors gracefully', async () => {
      const user = userEvent.setup()
      vi.mocked(offerService.rejectOffer).mockRejectedValueOnce({
        response: { data: { error: 'Failed to reject' } }
      })

      render(<OfferCard offer={baseOffer} viewType="seller" />)
      
      const rejectBtn = screen.getByRole('button', { name: /Reject/i })
      await user.click(rejectBtn)
      
      const confirmBtn = screen.getByRole('button', { name: 'Yes, Reject Offer' })
      await user.click(confirmBtn)
      
      expect(mockToast.error).toHaveBeenCalledWith('Failed to reject')
    })

    it('handles counter offer API errors gracefully', async () => {
      const user = userEvent.setup()
      vi.mocked(offerService.counterOffer).mockRejectedValueOnce({
        response: { data: { error: 'Failed to counter' } }
      })

      render(<OfferCard offer={baseOffer} viewType="seller" />)
      
      // Open counter form
      await user.click(screen.getByRole('button', { name: /Make Counter Offer/i }))
      
      // Fill form
      const input = screen.getByLabelText(/Counter Amount/i)
      await user.type(input, '90000')
      
      await user.click(screen.getByRole('button', { name: /Send Counter/i }))
      
      expect(mockToast.error).toHaveBeenCalledWith('Failed to counter')
    })
  })

  describe('Navigation', () => {
    it('navigates to product details when clicking product info', async () => {
      const user = userEvent.setup()
      render(<OfferCard offer={baseOffer} viewType="buyer" />)
      
      const productInfo = screen.getByText('Test Phone').closest('.offer-product-info')
      if (productInfo) {
        await user.click(productInfo)
      }
      
      expect(mockNavigate).toHaveBeenCalledWith('/products/prod-1')
    })
  })
})
