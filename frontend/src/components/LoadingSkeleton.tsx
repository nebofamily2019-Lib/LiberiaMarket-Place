import React from 'react'
import '../styles/LoadingSkeleton.css'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  )
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="product-card-skeleton" data-testid="product-skeleton">
      <Skeleton height="200px" borderRadius="8px" className="skeleton-image" />
      <div className="skeleton-content">
        <Skeleton height="24px" width="80%" className="skeleton-title" />
        <Skeleton height="20px" width="60%" className="skeleton-price" />
        <Skeleton height="16px" width="100%" className="skeleton-description" />
        <Skeleton height="16px" width="90%" className="skeleton-description" />
        <div className="skeleton-footer">
          <Skeleton height="14px" width="40%" className="skeleton-location" />
          <Skeleton height="32px" width="100px" borderRadius="16px" className="skeleton-button" />
        </div>
      </div>
    </div>
  )
}

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <div className="product-details-skeleton">
      <div className="skeleton-gallery">
        <Skeleton height="400px" borderRadius="12px" />
        <div className="skeleton-thumbnails">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="80px" width="80px" borderRadius="8px" />
          ))}
        </div>
      </div>
      <div className="skeleton-info">
        <Skeleton height="32px" width="70%" className="skeleton-title" />
        <Skeleton height="28px" width="30%" className="skeleton-price" />
        <Skeleton height="20px" width="100%" className="skeleton-description" />
        <Skeleton height="20px" width="100%" className="skeleton-description" />
        <Skeleton height="20px" width="80%" className="skeleton-description" />
        <div className="skeleton-actions">
          <Skeleton height="48px" width="150px" borderRadius="24px" />
          <Skeleton height="48px" width="150px" borderRadius="24px" />
        </div>
      </div>
    </div>
  )
}

export const CategoryListSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="category-list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="category-card-skeleton">
          <Skeleton height="60px" width="60px" borderRadius="50%" className="skeleton-icon" />
          <Skeleton height="18px" width="80px" className="skeleton-category-name" />
          <Skeleton height="14px" width="60px" className="skeleton-count" />
        </div>
      ))}
    </div>
  )
}

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="profile-skeleton">
      <div className="skeleton-header">
        <Skeleton height="100px" width="100px" borderRadius="50%" className="skeleton-avatar" />
        <div className="skeleton-user-info">
          <Skeleton height="28px" width="200px" className="skeleton-name" />
          <Skeleton height="20px" width="150px" className="skeleton-role" />
        </div>
      </div>
      <div className="skeleton-stats">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-stat-card">
            <Skeleton height="40px" width="60px" />
            <Skeleton height="16px" width="80px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const TableSkeleton: React.FC<{ rows?: number, columns?: number }> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="table-skeleton">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" width="100%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" width="100%" />
          ))}
        </div>
      ))}
    </div>
  )
}

export const FormSkeleton: React.FC = () => {
  return (
    <div className="form-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-form-field">
          <Skeleton height="16px" width="120px" className="skeleton-label" />
          <Skeleton height="40px" width="100%" borderRadius="6px" className="skeleton-input" />
        </div>
      ))}
      <Skeleton height="48px" width="150px" borderRadius="24px" className="skeleton-submit-button" />
    </div>
  )
}
