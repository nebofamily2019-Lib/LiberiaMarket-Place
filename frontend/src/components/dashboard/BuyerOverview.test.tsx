import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import BuyerOverview from './BuyerOverview'
import { Offer } from '../../services/offerService'

// Mock OfferCard
vi.mock('../OfferCard', () => ({
  default: ({ offer }: { offer: any }) => <div data-testid="offer-card">{offer.id}</div>
}))

describe('BuyerOverview', () => {
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
      buyer: { id: 'b1', name: 'Buyer 1' },
      seller_id: 's1',
      buyer_id: 'b1',
      product_id: 'p1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  it('groups sent offers by product', () => {
    render(
      <BuyerOverview 
        purchases={[]} 
        recentActivity={[]} 
        sentOffers={mockOffers} 
      />
    )

    // Should see product title
    expect(screen.getByText('Product 1')).toBeInTheDocument()

    // Should see offer count
    expect(screen.getByText('2 offers')).toBeInTheDocument()

    // Should render all offer cards
    const offerCards = screen.getAllByTestId('offer-card')
    expect(offerCards).toHaveLength(2)
  })

  it('renders correctly with no offers', () => {
    render(
      <BuyerOverview 
        purchases={[]} 
        recentActivity={[]} 
        sentOffers={[]} 
      />
    )

    expect(screen.queryByText('Your Offers')).not.toBeInTheDocument()
  })
})
