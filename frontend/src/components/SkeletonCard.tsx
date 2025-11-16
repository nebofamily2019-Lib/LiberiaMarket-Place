import { designSystem } from '../styles/designSystem'

const SkeletonCard = () => {
  return (
    <div style={{
      background: 'white',
      borderRadius: designSystem.borderRadius.lg,
      overflow: 'hidden',
      boxShadow: designSystem.shadows.md
    }}>
      {/* Image skeleton */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite'
      }} />

      {/* Content skeleton */}
      <div style={{ padding: designSystem.spacing.md }}>
        <div style={{
          height: '20px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: designSystem.borderRadius.sm,
          marginBottom: designSystem.spacing.md
        }} />
        <div style={{
          height: '16px',
          width: '60%',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: designSystem.borderRadius.sm
        }} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export default SkeletonCard
