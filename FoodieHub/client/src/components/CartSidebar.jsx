import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const {
    cartItems, cartRestaurant, cartType, setCartType,
    isCartOpen, setIsCartOpen,
    updateQuantity, removeItem, clearCart,
    subtotal, deliveryFee, taxes, total, itemCount,
  } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setIsCartOpen(false);
      navigate('/login');
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <div className="cart-sidebar" id="cart-sidebar">
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 className="font-display font-bold text-xl">Your Cart</h2>
            {cartRestaurant && (
              <p className="text-sm text-muted" style={{ marginTop: 2 }}>
                {cartRestaurant.name} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
          <button
            id="cart-close-btn"
            className="btn btn-ghost btn-icon"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem',
            }}>
              <ShoppingBag size={36} color="var(--text-muted)" />
            </div>
            <h3 className="font-semibold text-lg text-center">Your cart is empty</h3>
            <p className="text-muted text-sm text-center" style={{ marginTop: '0.5rem', maxWidth: 200 }}>
              Add delicious items from any restaurant to get started
            </p>
            <button
              id="cart-explore-btn"
              className="btn btn-primary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => { setIsCartOpen(false); navigate('/restaurants'); }}
            >
              Explore Restaurants
            </button>
          </div>
        ) : (
          <>
            {/* Order Type Selector */}
            {cartRestaurant && (
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Type</p>
                <div className="flex gap-2">
                  {cartRestaurant.features?.delivery && (
                    <button
                      id="cart-type-delivery"
                      className={`flex items-center gap-1.5 tag ${cartType === 'delivery' ? 'active' : ''}`}
                      onClick={() => setCartType('delivery')}
                    >
                      <Truck size={13} /> Delivery
                    </button>
                  )}
                  {cartRestaurant.features?.dineIn && (
                    <button
                      id="cart-type-dinein"
                      className={`flex items-center gap-1.5 tag ${cartType === 'dine-in' ? 'active' : ''}`}
                      onClick={() => setCartType('dine-in')}
                    >
                      <UtensilsCrossed size={13} /> Dine-In
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.5rem' }}>
              {cartItems.map((item) => (
                <div key={item.menuItemId} className="animate-fadeIn" style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {/* Veg/Non-veg indicator */}
                  <div style={{
                    width: 12, height: 12, flexShrink: 0,
                    borderRadius: item.isVeg ? '50%' : 2,
                    border: `2px solid ${item.isVeg ? 'var(--success)' : 'var(--error)'}`,
                    background: item.isVeg ? 'var(--success)' : 'var(--error)',
                    opacity: 0.8,
                  }} />

                  <div style={{ flex: 1 }}>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`cart-decrease-${item.menuItemId}`}
                      className="btn btn-secondary btn-icon"
                      style={{ width: 28, height: 28, borderRadius: 8 }}
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-sm" style={{ minWidth: 16, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      id={`cart-increase-${item.menuItemId}`}
                      className="btn btn-primary btn-icon"
                      style={{ width: 28, height: 28, borderRadius: 8 }}
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    id={`cart-remove-${item.menuItemId}`}
                    className="btn btn-ghost btn-icon"
                    style={{ width: 28, height: 28 }}
                    onClick={() => removeItem(item.menuItemId)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} color="var(--error)" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary & Checkout */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
            }}>
              <div className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                {cartType === 'delivery' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">GST (5%)</span>
                  <span>₹{taxes.toFixed(0)}</span>
                </div>
                <div className="divider" style={{ margin: '0.25rem 0' }} />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(0)}</span>
                </div>
              </div>

              <button
                id="cart-checkout-btn"
                className="btn btn-primary w-full btn-lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <button
                id="cart-clear-btn"
                className="btn btn-ghost w-full text-sm"
                style={{ marginTop: '0.5rem', color: 'var(--error)' }}
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
