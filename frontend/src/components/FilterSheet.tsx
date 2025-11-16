import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { designSystem } from '../styles/designSystem'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: any) => void
}

const FilterSheet = ({ isOpen, onClose, onApply }: FilterSheetProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [condition, setCondition] = useState<string>('')
  const [location, setLocation] = useState<string>('')

  const handleApply = () => {
    onApply({
      priceRange,
      condition,
      location
    })
    onClose()
  }

  const handleReset = () => {
    setPriceRange([0, 10000])
    setCondition('')
    setLocation('')
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 style={{ 
        fontSize: designSystem.typography.fontSize['2xl'], 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: designSystem.spacing.lg
      }}>
        Filter Products
      </h2>

      {/* Price Range */}
      <div style={{ marginBottom: designSystem.spacing.xl }}>
        <label style={{ 
          display: 'block', 
          marginBottom: designSystem.spacing.sm,
          fontWeight: designSystem.typography.fontWeight.semibold 
        }}>
          Price Range
        </label>
        <div style={{ display: 'flex', gap: designSystem.spacing.md, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            style={{
              flex: 1,
              padding: designSystem.spacing.sm,
              border: `1px solid ${designSystem.colors.neutral[200]}`,
              borderRadius: designSystem.borderRadius.sm,
              fontSize: designSystem.typography.fontSize.base
            }}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            style={{
              flex: 1,
              padding: designSystem.spacing.sm,
              border: `1px solid ${designSystem.colors.neutral[200]}`,
              borderRadius: designSystem.borderRadius.sm,
              fontSize: designSystem.typography.fontSize.base
            }}
          />
        </div>
      </div>

      {/* Condition */}
      <div style={{ marginBottom: designSystem.spacing.xl }}>
        <label style={{ 
          display: 'block', 
          marginBottom: designSystem.spacing.sm,
          fontWeight: designSystem.typography.fontWeight.semibold 
        }}>
          Condition
        </label>
        <div style={{ display: 'flex', gap: designSystem.spacing.sm, flexWrap: 'wrap' }}>
          {['new', 'like-new', 'good', 'fair'].map((cond) => (
            <button
              key={cond}
              onClick={() => setCondition(condition === cond ? '' : cond)}
              style={{
                padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
                background: condition === cond ? designSystem.colors.primary[500] : 'white',
                color: condition === cond ? 'white' : designSystem.colors.neutral[900],
                border: `1px solid ${condition === cond ? designSystem.colors.primary[500] : designSystem.colors.neutral[200]}`,
                borderRadius: designSystem.borderRadius.full,
                fontSize: designSystem.typography.fontSize.sm,
                fontWeight: designSystem.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div style={{ marginBottom: designSystem.spacing.xl }}>
        <label style={{ 
          display: 'block', 
          marginBottom: designSystem.spacing.sm,
          fontWeight: designSystem.typography.fontWeight.semibold 
        }}>
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            width: '100%',
            padding: designSystem.spacing.sm,
            border: `1px solid ${designSystem.colors.neutral[200]}`,
            borderRadius: designSystem.borderRadius.sm,
            fontSize: designSystem.typography.fontSize.base
          }}
        >
          <option value="">All Locations</option>
          <option value="Monrovia">Monrovia</option>
          <option value="Gbarnga">Gbarnga</option>
          <option value="Buchanan">Buchanan</option>
          <option value="Kakata">Kakata</option>
        </select>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: designSystem.spacing.md }}>
        <button
          onClick={handleReset}
          style={{
            flex: 1,
            padding: designSystem.spacing.md,
            background: 'white',
            color: designSystem.colors.neutral[900],
            border: `1px solid ${designSystem.colors.neutral[200]}`,
            borderRadius: designSystem.borderRadius.md,
            fontSize: designSystem.typography.fontSize.base,
            fontWeight: designSystem.typography.fontWeight.semibold,
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          style={{
            flex: 2,
            padding: designSystem.spacing.md,
            background: designSystem.colors.primary[500],
            color: 'white',
            border: 'none',
            borderRadius: designSystem.borderRadius.md,
            fontSize: designSystem.typography.fontSize.base,
            fontWeight: designSystem.typography.fontWeight.bold,
            cursor: 'pointer'
          }}
        >
          Apply Filters
        </button>
      </div>
    </BottomSheet>
  )
}

export default FilterSheet
