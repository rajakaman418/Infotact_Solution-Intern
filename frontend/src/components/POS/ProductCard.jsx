export default function ProductCard({ product, onAdd }) {
  const firstVariant = product.variants?.[0];

  return (
    <div className="product-card">
      <div className="product-card-head">
        <div>
          <h3>{product.title}</h3>
          <p className="muted-text">{product.brand}</p>
        </div>

        <span className="badge">{product.category}</span>
      </div>

      <p className="product-description">
        {product.description || "No description available"}
      </p>

      {firstVariant ? (
        <div className="variant-box">
          <div className="variant-row">
            <span>SKU</span>
            <strong>{firstVariant.sku}</strong>
          </div>

          <div className="variant-row">
            <span>Price</span>
            <strong>₹ {firstVariant.price}</strong>
          </div>

          <div className="variant-row">
            <span>Variant</span>
            <strong>
              {firstVariant.size || "-"} / {firstVariant.color || "-"}
            </strong>
          </div>
        </div>
      ) : (
        <div className="variant-box">
          <div className="variant-row">
            <span>No variant available</span>
          </div>
        </div>
      )}

      <button
        className="primary-btn"
        onClick={() => firstVariant && onAdd(product, firstVariant)}
        disabled={!firstVariant}
      >
        {firstVariant ? "Add to Cart" : "Unavailable"}
      </button>
    </div>
  );
}