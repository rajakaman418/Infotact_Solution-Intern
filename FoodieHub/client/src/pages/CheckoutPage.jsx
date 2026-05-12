import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, UtensilsCrossed, MapPin, Calendar, Clock, Check, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'upi', label: 'UPI Payment', icon: '📱' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { id: 'wallet', label: 'FoodieHub Wallet', icon: '👛' },
];

const CheckoutPage = () => {
  const { cartItems, cartRestaurant, cartType, subtotal, deliveryFee, taxes, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [reservationDetails, setReservationDetails] = useState({
    date: '',
    time: '',
    partySize: 2,
    specialRequests: '',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        restaurantId: cartRestaurant._id,
        type: cartType,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        paymentMethod,
        specialInstructions,
      };

      if (cartType === 'delivery') {
        orderData.deliveryAddress = deliveryAddress;
      } else {
        orderData.reservationDetails = reservationDetails;
      }

      const { data } = await api.post('/orders', orderData);

      clearCart();
      setStep(3);

      // Navigate to order tracking after 2s
      setTimeout(() => {
        navigate(`/orders/${data.data._id}`);
      }, 2500);

      toast.success('Order placed successfully! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    navigate('/restaurants');
    return null;
  }

  return (
    <div className="page">
      <div className="container-sm">
        <h1 className="font-display font-bold text-3xl" style={{ marginBottom: '2rem' }}>
          {step === 3 ? '🎉 Order Placed!' : 'Checkout'}
        </h1>

        {step === 3 ? (
          /* Success State */
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', animation: 'slideUp 0.5s ease' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, var(--success), #34d399)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
            }}>
              <Check size={40} color="white" strokeWidth={3} />
            </div>
            <h2 className="font-display font-bold text-2xl" style={{ marginBottom: '0.75rem' }}>
              Order Confirmed!
            </h2>
            <p className="text-muted" style={{ maxWidth: 320, margin: '0 auto' }}>
              Your order is being processed. You'll be redirected to tracking in a moment...
            </p>
            <div className="spinner" style={{ margin: '1.5rem auto 0' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
            {/* Left: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Order Type Summary */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div className="flex items-center gap-3">
                  {cartType === 'delivery' ? <Truck size={20} color="var(--primary)" /> : <UtensilsCrossed size={20} color="var(--primary)" />}
                  <div>
                    <p className="font-semibold">{cartType === 'delivery' ? 'Delivery Order' : 'Dine-In / Reservation'}</p>
                    <p className="text-sm text-muted">{cartRestaurant?.name}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address / Reservation Details */}
              {cartType === 'delivery' ? (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 className="font-semibold" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--primary)" /> Delivery Address
                  </h3>
                  <div style={{ display: 'grid', gap: '0.875rem' }}>
                    <div className="form-group">
                      <label className="form-label">Street Address *</label>
                      <input id="checkout-street" className="input" placeholder="Enter street address" value={deliveryAddress.street} onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input id="checkout-city" className="input" placeholder="City" value={deliveryAddress.city} onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">ZIP Code *</label>
                        <input id="checkout-zip" className="input" placeholder="ZIP" value={deliveryAddress.zipCode} onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 className="font-semibold" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="var(--primary)" /> Reservation Details
                  </h3>
                  <div style={{ display: 'grid', gap: '0.875rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Date *</label>
                        <input id="checkout-date" type="date" className="input" value={reservationDetails.date} onChange={(e) => setReservationDetails({ ...reservationDetails, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Time *</label>
                        <input id="checkout-time" type="time" className="input" value={reservationDetails.time} onChange={(e) => setReservationDetails({ ...reservationDetails, time: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Party Size</label>
                      <select id="checkout-party-size" className="input" value={reservationDetails.partySize} onChange={(e) => setReservationDetails({ ...reservationDetails, partySize: parseInt(e.target.value) })}>
                        {[1,2,3,4,5,6,7,8,10,12].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Special Requests</label>
                      <textarea id="checkout-special-requests" className="input" rows={2} placeholder="Allergies, seating preferences..." value={reservationDetails.specialRequests} onChange={(e) => setReservationDetails({ ...reservationDetails, specialRequests: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 className="font-semibold" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={16} color="var(--primary)" /> Payment Method
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      id={`payment-${method.id}`}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        padding: '1rem', borderRadius: 'var(--radius-md)',
                        border: `2px solid ${paymentMethod === method.id ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentMethod === method.id ? 'var(--primary-glow)' : 'var(--bg-elevated)',
                        cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition)',
                        display: 'flex', flexDirection: 'column', gap: '0.25rem',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: paymentMethod === method.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Card Details (simulated) */}
                {paymentMethod === 'card' && (
                  <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.75rem', animation: 'slideDown 0.2s ease' }}>
                    <input id="card-number" className="input" placeholder="4111 1111 1111 1111" maxLength={19} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input id="card-expiry" className="input" placeholder="MM/YY" maxLength={5} />
                      <input id="card-cvv" className="input" placeholder="CVV" maxLength={3} type="password" />
                    </div>
                    <p className="text-xs text-muted">🔒 This is a simulated payment for demonstration purposes</p>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="form-group">
                <label className="form-label">Special Instructions (Optional)</label>
                <textarea id="checkout-instructions" className="input" rows={2} placeholder="Any notes for the restaurant..." value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div>
              <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '5rem' }}>
                <h3 className="font-semibold" style={{ marginBottom: '1.25rem' }}>Order Summary</h3>

                {cartItems.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm" style={{ marginBottom: '0.625rem' }}>
                    <span className="text-muted">{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}

                <div className="divider" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
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
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  id="place-order-btn"
                  className="btn btn-primary w-full btn-lg"
                  onClick={handlePlaceOrder}
                  disabled={loading || (cartType === 'delivery' && !deliveryAddress.street)}
                >
                  {loading ? (
                    <><div className="spinner" style={{ width: 18, height: 18 }} /> Processing Payment...</>
                  ) : (
                    <>Place Order · ₹{total.toFixed(0)} <ChevronRight size={18} /></>
                  )}
                </button>

                <p className="text-xs text-muted text-center" style={{ marginTop: '0.75rem' }}>
                  🔒 Secure payment · 100% money-back guarantee
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
