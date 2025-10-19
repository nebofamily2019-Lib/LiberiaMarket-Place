import React from 'react'
import { speakPrompt } from '../utils/voiceAssistant'

interface LargeActionButtonProps {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
  voicePromptKey?: string // optional prompt key to speak on press (uses templates)
  ariaLabel?: string
  disabled?: boolean
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: 'var(--color-primary)', color: 'white', border: 'none' },
  secondary: { background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' },
  accent: { background: '#25D366', color: 'white', border: 'none' }
}

const LargeActionButton = ({ label, icon, onClick, variant = 'primary', voicePromptKey, ariaLabel, disabled }: LargeActionButtonProps) => {
  const handleClick = () => {
    if (disabled) return
    if (voicePromptKey) {
      speakPrompt(voicePromptKey)
    }
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel || label}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'center',
        padding: '16px 20px',
        borderRadius: 12,
        fontSize: '1.1rem',
        fontWeight: 700,
        minWidth: 160,
        minHeight: 56,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...variantStyles[variant]
      }}
    >
      {icon && <span style={{ fontSize: '1.6rem' }}>{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

export default LargeActionButton
