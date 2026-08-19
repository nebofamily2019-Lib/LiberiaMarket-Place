import { 
  ShoppingBasket, 
  Scissors, 
  Smartphone, 
  Car, 
  Hammer, 
  Zap, 
  Wrench, 
  BookOpen, 
  Package
} from 'lucide-react';

export const getCategoryIcon = (slug: string, size: number = 24, className: string = '', color?: string) => {
  const iconProps = { size, className, color };

  switch (slug) {
    case 'market-grounds':
      return <ShoppingBasket {...iconProps} />;
    case 'fashion-tailoring':
      return <Scissors {...iconProps} />;
    case 'phones-electronics':
      return <Smartphone {...iconProps} />;
    case 'vehicles-transport':
      return <Car {...iconProps} />;
    case 'building-materials':
      return <Hammer {...iconProps} />;
    case 'home-energy':
      return <Zap {...iconProps} />;
    case 'services-labor':
      return <Wrench {...iconProps} />;
    case 'education':
      return <BookOpen {...iconProps} />;
    default:
      return <Package {...iconProps} />;
  }
};
