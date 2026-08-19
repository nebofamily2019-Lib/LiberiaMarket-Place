import { designSystem } from '../styles/designSystem';
import { useLanguage } from '../context/LanguageContext';

const TermsOfService = () => {
  const { t } = useLanguage();

  return (
    <div style={{ padding: designSystem.spacing.xl, maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: designSystem.typography.fontSize['3xl'], 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: designSystem.spacing.lg,
        color: designSystem.colors.neutral[900]
      }}>
        {t.legal.tosTitle} 📜
      </h1>
      
      <p style={{ color: designSystem.colors.neutral[500], marginBottom: designSystem.spacing.xl }}>
        {t.legal.lastUpdated}: December 9, 2025
      </p>

      <section style={{ marginBottom: designSystem.spacing['2xl'] }}>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          {t.legal.intro}
        </p>
      </section>

      <section style={{ marginBottom: designSystem.spacing['2xl'] }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: designSystem.spacing.md }}>
          1. {t.legal.mobileMoney}
        </h2>
        <p style={{ lineHeight: '1.6', color: designSystem.colors.neutral[500] }}>
          {t.legal.mobileMoneyText}
        </p>
      </section>

      <section style={{ marginBottom: designSystem.spacing['2xl'] }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: designSystem.spacing.md }}>
          2. {t.legal.prohibitedItems}
        </h2>
        <p style={{ lineHeight: '1.6', color: designSystem.colors.neutral[500] }}>
          {t.legal.prohibitedText}
        </p>
      </section>

      <section style={{ marginBottom: designSystem.spacing['2xl'] }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: designSystem.spacing.md }}>
          3. {t.legal.disputes}
        </h2>
        <p style={{ lineHeight: '1.6', color: designSystem.colors.neutral[500] }}>
          {t.legal.disputesText}
        </p>
      </section>

      <div style={{ 
        marginTop: designSystem.spacing['3xl'], 
        padding: designSystem.spacing.xl, 
        backgroundColor: designSystem.colors.neutral[100], 
        borderRadius: '8px' 
      }}>
        <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
          Liberia Marketplace &copy; 2025
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
