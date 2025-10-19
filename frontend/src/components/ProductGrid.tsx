import ProductCard, { Product } from './ProductCard'

/**
 * ProductGrid Component
 * - Responsive grid layout
 * - 2 columns on mobile, 3 on tablet, 4 on desktop
 * - Displays products using ProductCard components
 */
interface ProductGridProps {
  products: Product[]
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center p-xl">
        <p className="text-secondary">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
