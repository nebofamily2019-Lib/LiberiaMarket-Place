import { useState, useEffect } from 'react';
import { savedItemService } from '../services/savedItemService';
import ProductCard from '../components/ProductCard';
import { designSystem } from '../styles/designSystem';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { useLanguage } from '../context/LanguageContext';

const SavedItems = () => {
  const { t } = useLanguage();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const response = await savedItemService.getSavedItems();
      setSavedItems(response.data);
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: designSystem.spacing.lg }}>
        <ProductGridSkeleton />
      </div>
    );
  }

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: designSystem.typography.fontSize['3xl'], 
        fontWeight: designSystem.typography.fontWeight.bold,
        marginBottom: designSystem.spacing.xl,
        color: designSystem.colors.neutral[900]
      }}>
        {t.common.savedItems}
      </h1>

      {savedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: designSystem.spacing['2xl'] }}>
          <p style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[500] }}>
            {t.common.savedItemsEmpty}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: designSystem.spacing.lg 
        }}>
          {savedItems.filter(item => item.product).map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
