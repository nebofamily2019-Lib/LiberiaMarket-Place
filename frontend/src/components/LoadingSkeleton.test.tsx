import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  ProductDetailsSkeleton,
  CategoryListSkeleton,
  ProfileSkeleton,
  TableSkeleton,
  FormSkeleton
} from './LoadingSkeleton'

describe('LoadingSkeleton Components', () => {
  describe('Skeleton', () => {
    it('renders with default props', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('.skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    it('applies custom width and height', () => {
      const { container } = render(<Skeleton width="200px" height="50px" />)
      const skeleton = container.querySelector('.skeleton') as HTMLElement
      expect(skeleton?.style.width).toBe('200px')
      expect(skeleton?.style.height).toBe('50px')
    })

    it('applies custom border radius', () => {
      const { container } = render(<Skeleton borderRadius="12px" />)
      const skeleton = container.querySelector('.skeleton') as HTMLElement
      expect(skeleton?.style.borderRadius).toBe('12px')
    })

    it('accepts custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />)
      const skeleton = container.querySelector('.skeleton')
      expect(skeleton).toHaveClass('skeleton')
      expect(skeleton).toHaveClass('custom-class')
    })
  })

  describe('ProductCardSkeleton', () => {
    it('renders product card skeleton structure', () => {
      render(<ProductCardSkeleton />)
      const skeleton = screen.getByTestId('product-skeleton')
      expect(skeleton).toBeInTheDocument()
    })

    it('contains image skeleton', () => {
      const { container } = render(<ProductCardSkeleton />)
      const imageSkeleton = container.querySelector('.skeleton-image')
      expect(imageSkeleton).toBeInTheDocument()
    })

    it('contains content skeletons', () => {
      const { container } = render(<ProductCardSkeleton />)
      expect(container.querySelector('.skeleton-title')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-price')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-description')).toBeInTheDocument()
    })

    it('contains footer with location and button skeleton', () => {
      const { container } = render(<ProductCardSkeleton />)
      expect(container.querySelector('.skeleton-footer')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-location')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-button')).toBeInTheDocument()
    })
  })

  describe('ProductGridSkeleton', () => {
    it('renders default number of skeleton cards', () => {
      const { container } = render(<ProductGridSkeleton />)
      const skeletons = container.querySelectorAll('.product-card-skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('renders custom number of skeleton cards', () => {
      const { container } = render(<ProductGridSkeleton count={10} />)
      const skeletons = container.querySelectorAll('.product-card-skeleton')
      expect(skeletons).toHaveLength(10)
    })

    it('uses grid layout', () => {
      const { container } = render(<ProductGridSkeleton />)
      const grid = container.querySelector('.product-grid')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('ProductDetailsSkeleton', () => {
    it('renders gallery section', () => {
      const { container } = render(<ProductDetailsSkeleton />)
      expect(container.querySelector('.skeleton-gallery')).toBeInTheDocument()
    })

    it('renders thumbnail skeletons', () => {
      const { container } = render(<ProductDetailsSkeleton />)
      const thumbnails = container.querySelectorAll('.skeleton-thumbnails .skeleton')
      expect(thumbnails.length).toBeGreaterThan(0)
    })

    it('renders info section', () => {
      const { container } = render(<ProductDetailsSkeleton />)
      expect(container.querySelector('.skeleton-info')).toBeInTheDocument()
    })

    it('renders action buttons skeleton', () => {
      const { container } = render(<ProductDetailsSkeleton />)
      expect(container.querySelector('.skeleton-actions')).toBeInTheDocument()
    })
  })

  describe('CategoryListSkeleton', () => {
    it('renders default number of category cards', () => {
      const { container } = render(<CategoryListSkeleton />)
      const cards = container.querySelectorAll('.category-card-skeleton')
      expect(cards).toHaveLength(8)
    })

    it('renders custom number of category cards', () => {
      const { container } = render(<CategoryListSkeleton count={5} />)
      const cards = container.querySelectorAll('.category-card-skeleton')
      expect(cards).toHaveLength(5)
    })

    it('each card has icon, name, and count skeletons', () => {
      const { container } = render(<CategoryListSkeleton count={1} />)
      expect(container.querySelector('.skeleton-icon')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-category-name')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-count')).toBeInTheDocument()
    })
  })

  describe('ProfileSkeleton', () => {
    it('renders profile header', () => {
      const { container } = render(<ProfileSkeleton />)
      expect(container.querySelector('.skeleton-header')).toBeInTheDocument()
    })

    it('renders avatar skeleton', () => {
      const { container } = render(<ProfileSkeleton />)
      expect(container.querySelector('.skeleton-avatar')).toBeInTheDocument()
    })

    it('renders user info skeletons', () => {
      const { container } = render(<ProfileSkeleton />)
      expect(container.querySelector('.skeleton-name')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-role')).toBeInTheDocument()
    })

    it('renders stats section', () => {
      const { container } = render(<ProfileSkeleton />)
      const stats = container.querySelectorAll('.skeleton-stat-card')
      expect(stats).toHaveLength(3)
    })
  })

  describe('TableSkeleton', () => {
    it('renders default table structure', () => {
      const { container } = render(<TableSkeleton />)
      expect(container.querySelector('.table-skeleton')).toBeInTheDocument()
    })

    it('renders header row', () => {
      const { container } = render(<TableSkeleton />)
      expect(container.querySelector('.skeleton-table-header')).toBeInTheDocument()
    })

    it('renders correct number of rows', () => {
      const { container } = render(<TableSkeleton rows={3} />)
      const rows = container.querySelectorAll('.skeleton-table-row')
      expect(rows).toHaveLength(3)
    })

    it('renders with custom rows and columns', () => {
      const { container } = render(<TableSkeleton rows={7} columns={5} />)
      const rows = container.querySelectorAll('.skeleton-table-row')
      expect(rows).toHaveLength(7)
    })
  })

  describe('FormSkeleton', () => {
    it('renders form structure', () => {
      const { container } = render(<FormSkeleton />)
      expect(container.querySelector('.form-skeleton')).toBeInTheDocument()
    })

    it('renders form fields', () => {
      const { container } = render(<FormSkeleton />)
      const fields = container.querySelectorAll('.skeleton-form-field')
      expect(fields).toHaveLength(4)
    })

    it('each field has label and input skeleton', () => {
      const { container } = render(<FormSkeleton />)
      expect(container.querySelector('.skeleton-label')).toBeInTheDocument()
      expect(container.querySelector('.skeleton-input')).toBeInTheDocument()
    })

    it('renders submit button skeleton', () => {
      const { container } = render(<FormSkeleton />)
      expect(container.querySelector('.skeleton-submit-button')).toBeInTheDocument()
    })
  })

  describe('Animation', () => {
    it('skeleton has shimmer animation class', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('.skeleton')
      expect(skeleton).toHaveClass('skeleton')
    })
  })

  describe('Accessibility', () => {
    it('skeleton elements are not focusable', () => {
      const { container } = render(<ProductCardSkeleton />)
      const skeletons = container.querySelectorAll('.skeleton')
      skeletons.forEach(skeleton => {
        expect(skeleton).not.toHaveAttribute('tabindex')
      })
    })
  })
})
