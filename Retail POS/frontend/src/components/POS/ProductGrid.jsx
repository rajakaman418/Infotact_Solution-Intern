import ProductCard from "./ProductCard";

export default function ProductGrid({ products, onAdd }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <h3>No products found</h3>
        <p>Try changing your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}