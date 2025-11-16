import { useState } from 'react'
import { designSystem } from '../styles/designSystem'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const BottomSheet = ({ isOpen, onClose, children }: BottomSheetProps) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s'
          }}
        />
      )}

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTopLeftRadius: designSystem.borderRadius.xl,
        borderTopRightRadius: designSystem.borderRadius.xl,
        padding: designSystem.spacing.xl,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)'
      }}>
        {/* Handle */}
        <div style={{
          width: '40px',
          height: '4px',
          background: designSystem.colors.neutral[200],
          borderRadius: '2px',
          margin: `0 auto ${designSystem.spacing.md}`
        }} />

        {children}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}

export default BottomSheet
