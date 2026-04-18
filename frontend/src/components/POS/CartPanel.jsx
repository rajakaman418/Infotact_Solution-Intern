import { useCart } from "../../context/CartContext";
import CartItem from "./CartItem";

export default function CartPanel({ onCheckout, loading }) {
  const {
    items,
    subtotal,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <aside className="cart-panel">
      <div className="cart-panel-header">
        <h2>Current Bill</h2>
        <span>{items.length} items</span>
      </div>

      <div className="cart-items">
        {!items.length ? (
          <div className="empty-cart">
            <h3>Cart is empty</h3>
            <p>Add products to start checkout.</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.variantId}`}
              item={item}
              onIncrease={() => increaseQty(item.productId, item.variantId)}
              onDecrease={() => decreaseQty(item.productId, item.variantId)}
              onRemove={() => removeItem(item.productId, item.variantId)}
            />
          ))
        )}
      </div>

      <div className="cart-footer">
        <div className="summary-line">
          <span>Subtotal</span>
          <strong>₹ {subtotal}</strong>
        </div>

        <div className="cart-footer-actions">
          <button
            className="secondary-btn"
            onClick={clearCart}
            disabled={!items.length}
          >
            Clear Cart
          </button>

          <button
            className="checkout-btn"
            onClick={onCheckout}
            disabled={!items.length || loading}
          >
            {loading ? "Processing..." : "Checkout"}
          </button>
        </div>
      </div>
    </aside>
  );
}