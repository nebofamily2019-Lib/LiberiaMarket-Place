import { useLanguage } from '../context/LanguageContext';
import { designSystem } from '../styles/designSystem';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={() => setLanguage('en')}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: language === 'en' ? designSystem.colors.primary[500] : 'transparent',
          color: language === 'en' ? 'white' : designSystem.colors.neutral[500],
          cursor: 'pointer',
          fontWeight: language === 'en' ? 'bold' : 'normal',
        }}
      >
        EN
      </button>
      <span style={{ color: designSystem.colors.neutral[200] }}>|</span>
      <button
        onClick={() => setLanguage('pidgin')}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: language === 'pidgin' ? designSystem.colors.primary[500] : 'transparent',
          color: language === 'pidgin' ? 'white' : designSystem.colors.neutral[500],
          cursor: 'pointer',
          fontWeight: language === 'pidgin' ? 'bold' : 'normal',
        }}
      >
        LIB
      </button>
    </div>
  );
};

export default LanguageToggle;
