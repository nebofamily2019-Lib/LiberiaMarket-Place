import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import SellerOverview from './SellerOverview'
import { Offer } from '../../services/offerService'

// Mock OfferCard to avoid complex rendering
vi.mock('../OfferCard', () => ({
  default: ({ offer }: { offer: any }) => <div data-testid="offer-card">{offer.id}</div>
}))

describe('SellerOverview', () => {
  const mockProducts = [
    { id: 'p1', title: 'Product 1', price: 100, status: 'active' },
    { id: 'p2', title: 'Product 2', price: 200, status: 'active' }
  ]

  const mockOffers: Offer[] = [
    {
      id: 'o1',
      amount: 90,
      status: 'pending',
      product: { id: 'p1', title: 'Product 1', price: 100, seller_id: 's1', images: [] },
      buyer: { id: 'b1', name: 'Buyer 1' },
      seller_id: 's1',
      buyer_id: 'b1',
      product_id: 'p1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'o2',
      amount: 95,
      status: 'pending',
      product: { id: 'p1', title: 'Product 1', price: 100, seller_id: 's1', images: [] },
      buyer: { id: 'b2', name: 'Buyer 2' },
      seller_id: 's1',
      buyer_id: 'b2',
      product_id: 'p1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'o3',
      amount: 180,
      status: 'pending',
      product: { id: 'p2', title: 'Product 2', price: 200, seller_id: 's1', images: [] },
      buyer: { id: 'b3', name: 'Buyer 3' },
      seller_id: 's1',
      buyer_id: 'b3',
      product_id: 'p2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  it('groups offers by product', () => {
    render(
      <SellerOverview 
        products={mockProducts} 
        receivedOffers={mockOffers} 
      />
    )

    // Should see product titles
    expect(screen.getAllByText('Product 1')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Product 2')[0]).toBeInTheDocument()

    // Should see offer counts
    expect(screen.getByText('2 offers')).toBeInTheDocument()
    expect(screen.getByText('1 offer')).toBeInTheDocument()

    // Should render all offer cards
    const offerCards = screen.getAllByTestId('offer-card')
    expect(offerCards).toHaveLength(3)
  })

  it('renders correctly with no offers', () => {
    render(
      <SellerOverview 
        products={mockProducts} 
        receivedOffers={[]} 
      />
    )

    expect(screen.queryByText('Received Offers')).not.toBeInTheDocument()
  })
})
