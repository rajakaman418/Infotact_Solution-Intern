export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="cart-item">
      <div>
        <strong>{item.title}</strong>
        <p>{item.sku}</p>
        <p>{item.variantLabel}</p>
      </div>

      <div className="cart-item-row">
        <div className="qty-box">
          <button onClick={onDecrease}>-</button>
          <span>{item.quantity}</span>
          <button onClick={onIncrease}>+</button>
        </div>

        <div className="cart-price">₹ {item.price * item.quantity}</div>
      </div>

      <button className="remove-btn" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}