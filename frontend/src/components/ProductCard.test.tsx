import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test/test-utils'
import ProductCard, { Product } from './ProductCard'

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: 1,
    title: 'Samsung Galaxy S21',
    price: 350,
    location: 'Monrovia',
    imageUrl: '/images/phone.jpg',
    category: 'Electronics',
  }

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument()
    expect(screen.getByText('L$350')).toBeInTheDocument()
    expect(screen.getByText('📍 Monrovia')).toBeInTheDocument()
  })

  it('formats price with thousands separator', () => {
    const expensiveProduct = { ...mockProduct, price: 1500000 }
    render(<ProductCard product={expensiveProduct} />)

    expect(screen.getByText('L$1,500,000')).toBeInTheDocument()
  })

  it('displays placeholder image when imageUrl is missing', () => {
    const productWithoutImage = { ...mockProduct, imageUrl: undefined }
    render(<ProductCard product={productWithoutImage} />)

    const img = screen.getByRole('img', { name: mockProduct.title })
    expect(img).toHaveAttribute('src', expect.stringContaining('placeholder'))
  })

  it('displays product image when imageUrl is provided', () => {
    render(<ProductCard product={mockProduct} />)

    const img = screen.getByRole('img', { name: mockProduct.title })
    expect(img).toHaveAttribute('src', '/images/phone.jpg')
  })

  it('does not render location when not provided', () => {
    const productWithoutLocation = { ...mockProduct, location: undefined }
    render(<ProductCard product={productWithoutLocation} />)

    expect(screen.queryByText(/📍/)).not.toBeInTheDocument()
  })

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/products/${mockProduct.id}`)
  })

  it('has lazy loading attribute on image', () => {
    render(<ProductCard product={mockProduct} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('renders with minimum required fields', () => {
    const minimalProduct: Product = {
      id: 2,
      title: 'Test Product',
      price: 100,
    }

    render(<ProductCard product={minimalProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('L$100')).toBeInTheDocument()
  })
})
