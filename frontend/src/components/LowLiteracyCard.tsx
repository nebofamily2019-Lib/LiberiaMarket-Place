import React from 'react'
import VoiceButton from './VoiceButton'

interface LowLiteracyCardProps {
  id?: string
  icon?: React.ReactNode
  title: string
  subtitle?: string
  badge?: string
  onClick?: () => void
  voiceText?: string
  ariaLabel?: string
}

const LowLiteracyCard = ({ id, icon, title, subtitle, badge, onClick, voiceText, ariaLabel }: LowLiteracyCardProps) => {
  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        background: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border)',
        minHeight: '84px',
        cursor: onClick ? 'pointer' : 'default'
      }}
      aria-label={ariaLabel || title}
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 12,
        background: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.8rem',
        flexShrink: 0
      }}>
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</div>
          {badge && <div style={{ background: 'var(--color-primary)', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: '0.8rem' }}>{badge}</div>}
        </div>
        {subtitle && <div style={{ marginTop: 6, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>{subtitle}</div>}
      </div>

      {voiceText && (
        <div style={{ marginLeft: 8 }}>
          <VoiceButton text={voiceText} size="medium" ariaLabel={`Listen: ${title}`} />
        </div>
      )}
    </div>
  )
}

export default LowLiteracyCard
