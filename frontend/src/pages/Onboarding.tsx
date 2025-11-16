import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { designSystem } from '../styles/designSystem'

const Onboarding = () => {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  const steps = [
    {
      icon: '🛍️',
      title: 'Buy & Sell Locally',
      description: 'Connect with sellers across Liberia. Find what you need or sell what you have.',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '🎤',
      title: 'Voice-First Design',
      description: 'No typing needed! Use voice to search, post products, and navigate the app.',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '🔒',
      title: 'Safe & Trusted',
      description: 'Verified sellers, secure transactions, and local pickup options.',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: steps[step].color,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: designSystem.spacing['2xl'],
      color: 'white',
      position: 'relative'
    }}>
      {/* Progress dots */}
      <div style={{ position: 'absolute', top: designSystem.spacing['2xl'], display: 'flex', gap: designSystem.spacing.sm }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: i === step ? 'white' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '8rem', marginBottom: designSystem.spacing['2xl'], animation: 'float 2s ease-in-out infinite' }}>
          {steps[step].icon}
        </div>
        <h1 style={{ 
          fontSize: designSystem.typography.fontSize['4xl'], 
          fontWeight: designSystem.typography.fontWeight.extrabold, 
          marginBottom: designSystem.spacing.md 
        }}>
          {steps[step].title}
        </h1>
        <p style={{ fontSize: designSystem.typography.fontSize.xl, lineHeight: 1.6, opacity: 0.95 }}>
          {steps[step].description}
        </p>
      </div>

      {/* Navigation */}
      <div style={{ 
        position: 'absolute', 
        bottom: designSystem.spacing['2xl'], 
        width: '100%', 
        maxWidth: '500px', 
        display: 'flex', 
        gap: designSystem.spacing.md, 
        padding: `0 ${designSystem.spacing['2xl']}` 
      }}>
        {step < steps.length - 1 ? (
          <>
            <button onClick={() => navigate('/')} style={{
              flex: 1,
              padding: designSystem.spacing.md,
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              borderRadius: designSystem.borderRadius.md,
              fontSize: designSystem.typography.fontSize.base,
              fontWeight: designSystem.typography.fontWeight.semibold,
              cursor: 'pointer'
            }}>
              Skip
            </button>
            <button onClick={() => setStep(step + 1)} style={{
              flex: 2,
              padding: designSystem.spacing.md,
              background: 'white',
              border: 'none',
              color: '#667eea',
              borderRadius: designSystem.borderRadius.md,
              fontSize: designSystem.typography.fontSize.base,
              fontWeight: designSystem.typography.fontWeight.bold,
              cursor: 'pointer'
            }}>
              Next
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/')} style={{
            width: '100%',
            padding: designSystem.spacing.md,
            background: 'white',
            border: 'none',
            color: '#667eea',
            borderRadius: designSystem.borderRadius.md,
            fontSize: designSystem.typography.fontSize.lg,
            fontWeight: designSystem.typography.fontWeight.bold,
            cursor: 'pointer'
          }}>
            Get Started 🚀
          </button>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}

export default Onboarding
