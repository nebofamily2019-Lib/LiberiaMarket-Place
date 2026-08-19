import { designSystem } from '../styles/designSystem';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const Safety = () => {
  const { t } = useLanguage();

  const safetyTips = [
    {
      icon: 'City',
      title: t.legal.meetPublic,
      desc: t.legal.meetPublicDesc
    },
    {
      icon: 'Check',
      title: t.legal.checkItem,
      desc: t.legal.checkItemDesc
    },
    {
      icon: 'Lock',
      title: t.legal.digitalSafety,
      desc: t.legal.digitalSafetyDesc
    },
    {
      icon: 'Flag',
      title: t.legal.reportSuspicious,
      desc: t.legal.reportSuspiciousDesc
    }
  ];

  return (
    <div style={{ padding: designSystem.spacing.xl, maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: designSystem.typography.fontSize['3xl'], 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: designSystem.spacing.lg,
        color: designSystem.colors.neutral[900],
        textAlign: 'center'
      }}>
        {t.legal.safetyTitle}
      </h1>

      <div style={{ 
        backgroundColor: '#ecfdf5', 
        padding: designSystem.spacing.xl, 
        borderRadius: '12px', 
        marginBottom: designSystem.spacing['2xl'],
        border: '1px solid #10b981'
      }}>
        <p style={{ fontSize: '1.2rem', textAlign: 'center', color: '#065f46' }}>
          {t.legal.safetyText}
        </p>
      </div>

      <div style={{ display: 'grid', gap: designSystem.spacing.xl }}>
        {safetyTips.map((tip, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            gap: designSystem.spacing.lg, 
            padding: designSystem.spacing.lg,
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: designSystem.shadows.sm
          }}>
            <div style={{ fontSize: '2.5rem' }}>{tip.icon}</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {tip.title}
              </h3>
              <p style={{ color: designSystem.colors.neutral[500], lineHeight: '1.5' }}>
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: designSystem.spacing['3xl'] }}>
        <p style={{ marginBottom: designSystem.spacing.md }}>
          Need to read the fine print?
        </p>
        <Link 
          to="/terms" 
          style={{ 
            color: designSystem.colors.primary[600], 
            fontWeight: 'bold',
            textDecoration: 'underline'
          }}
        >
          {t.legal.tosTitle}
        </Link>
      </div>
    </div>
  );
};

export default Safety;
