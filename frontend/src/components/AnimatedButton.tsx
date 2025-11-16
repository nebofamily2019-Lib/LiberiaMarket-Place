import { designSystem } from '../styles/designSystem'

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  icon?: string
}

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  icon
}: AnimatedButtonProps) => {
  const variants = {
    primary: {
      background: designSystem.colors.primary[500],
      color: 'white',
      border: 'none'
    },
    secondary: {
      background: designSystem.colors.accent.pink,
      color: 'white',
      border: 'none'
    },
    outline: {
      background: 'transparent',
      color: designSystem.colors.primary[500],
      border: `2px solid ${designSystem.colors.primary[500]}`
    }
  }

  const sizes = {
    sm: { padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`, fontSize: designSystem.typography.fontSize.sm },
    md: { padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`, fontSize: designSystem.typography.fontSize.base },
    lg: { padding: `${designSystem.spacing.lg} ${designSystem.spacing.xl}`, fontSize: designSystem.typography.fontSize.lg }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: designSystem.borderRadius.md,
        fontWeight: designSystem.typography.fontWeight.bold,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'scale(1)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: designSystem.spacing.sm
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
          e.currentTarget.style.boxShadow = designSystem.shadows.xl
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.95)'
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

export default AnimatedButton
