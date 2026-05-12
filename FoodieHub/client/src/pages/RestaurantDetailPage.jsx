import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Truck, Phone, Check, Plus, Minus, Leaf, Flame, ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const SPICE_COLORS = { mild: '#10b981', medium: '#f59e0b', hot: '#ef4444', 'extra-hot': '#dc2626' };

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [conflictModal, setConflictModal] = useState(null);
  const { addItem, cartItems, setIsCartOpen, clearCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, revRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/reviews/restaurant/${id}?limit=5`),
        ]);
        setRestaurant(rRes.data.data);
        setReviews(revRes.data.data || []);
      } catch (err) {
        navigate('/restaurants');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddItem = (item) => {
    const result = addItem(item, restaurant);
    if (result.conflict) {
      setConflictModal({ item, message: result.message });
    } else if (result.success) {
      toast.success(`${item.name} added to cart!`, { duration: 1500 });
    }
  };

  const handleConflictResolve = (clearAndAdd) => {
    if (clearAndAdd) {
      clearCart();
      addItem(conflictModal.item, restaurant);
      toast.success('Cart updated!');
    }
    setConflictModal(null);
  };

  const getCartQuantity = (itemId) => {
    return cartItems.find((ci) => ci.menuItemId === itemId)?.quantity || 0;
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (!restaurant) return null;

  const categories = ['All', ...new Set(restaurant.menu?.map((item) => item.category) || [])];
  const filteredMenu = activeCategory === 'All'
    ? restaurant.menu
    : restaurant.menu?.filter((item) => item.category === activeCategory);

  const avgRating = restaurant.rating || 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Cover */}
      <div className="relative overflow-hidden" style={{ height: 320 }}>
        <img
          src={restaurant.coverImage || restaurant.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200`}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)' }} />
        <div className="container" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
          <button
            id="restaurant-back-btn"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '0.5rem' }}>
                {restaurant.isVerified && <span className="badge badge-success"><Check size={10} /> Verified</span>}
                {restaurant.cuisineType?.map((c) => (
                  <span key={c} className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{c}</span>
                ))}
              </div>
              <h1 className="font-display font-bold" style={{ fontSize: '2.25rem', lineHeight: 1.1, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {restaurant.name}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', maxWidth: 500 }}>{restaurant.description}</p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 flex-wrap">
              {[
                { icon: <Star size={16} fill="currentColor" />, value: avgRating > 0 ? avgRating.toFixed(1) : 'New', label: `${restaurant.totalRatings} reviews`, color: 'var(--accent)' },
                { icon: <Clock size={16} />, value: `${restaurant.deliveryInfo?.estimatedTime || 30}`, label: 'min', color: 'var(--info)' },
                { icon: <Truck size={16} />, value: restaurant.deliveryInfo?.deliveryFee > 0 ? `₹${restaurant.deliveryInfo.deliveryFee}` : 'Free', label: 'delivery', color: 'var(--success)' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '0.75rem 1rem',
                  textAlign: 'center', minWidth: 90,
                  color: stat.color,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                    {stat.icon}
                    <span className="font-bold text-lg" style={{ color: 'white' }}>{stat.value}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
          {/* Menu Section */}
          <div>
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`menu-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flexShrink: 0, borderRadius: 'var(--radius-full)' }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredMenu?.filter((item) => item.isAvailable !== false || true).map((item) => {
                const qty = getCartQuantity(item._id);
                return (
                  <div key={item._id} id={`menu-item-${item._id}`} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    {/* Left: Info */}
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: '0.375rem' }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: item.isVeg ? '50%' : 2, flexShrink: 0,
                          border: `2px solid ${item.isVeg ? 'var(--success)' : 'var(--error)'}`,
                          background: item.isVeg ? 'var(--success)' : 'var(--error)',
                        }} />
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.spiceLevel && item.spiceLevel !== 'mild' && (
                          <Flame size={13} color={SPICE_COLORS[item.spiceLevel]} />
                        )}
                        {!item.isAvailable && <span className="badge badge-error" style={{ fontSize: '0.65rem' }}>Unavailable</span>}
                      </div>
                      <p className="text-sm text-muted" style={{ marginBottom: '0.75rem', lineHeight: 1.5 }}>{item.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>₹{item.price}</span>
                        {item.preparationTime && (
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <Clock size={11} /> {item.preparationTime} min
                          </span>
                        )}
                      </div>
                      {item.tags?.length > 0 && (
                        <div className="flex gap-1 flex-wrap" style={{ marginTop: '0.5rem' }}>
                          {item.tags.map((tag) => (
                            <span key={tag} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Image + Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            🍽️
                          </div>
                        )}
                      </div>

                      {!item.isAvailable ? (
                        <span className="text-xs text-muted">Not available</span>
                      ) : qty === 0 ? (
                        <button
                          id={`add-item-${item._id}`}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: 'var(--radius-full)' }}
                          onClick={() => handleAddItem(item)}
                        >
                          <Plus size={14} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            id={`decrease-item-${item._id}`}
                            className="btn btn-secondary btn-icon"
                            style={{ width: 28, height: 28, borderRadius: 8 }}
                            onClick={() => {
                              const { updateQuantity } = useCart();
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-bold">{qty}</span>
                          <button
                            id={`increase-item-${item._id}`}
                            className="btn btn-primary btn-icon"
                            style={{ width: 28, height: 28, borderRadius: 8 }}
                            onClick={() => handleAddItem(item)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h2 className="font-display font-bold text-2xl" style={{ marginBottom: '1.5rem' }}>
                  Customer Reviews
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((review) => (
                    <div key={review._id} className="card" style={{ padding: '1.25rem' }}>
                      <div className="flex items-start justify-between" style={{ marginBottom: '0.75rem' }}>
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: 'white', fontSize: '1rem', flexShrink: 0,
                          }}>
                            {review.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{review.user?.name}</p>
                            <div className="flex items-center gap-1">
                              <span className={`badge badge-${review.qualityTier}`} style={{ fontSize: '0.65rem' }}>
                                {review.qualityTier?.charAt(0).toUpperCase() + review.qualityTier?.slice(1)}
                              </span>
                              <span className="text-xs text-muted">· {review.pointsAwarded} pts</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 stars text-sm">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} size={12} fill={i < review.ratings.overall ? 'currentColor' : 'none'} />
                          ))}
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', marginLeft: 4 }}>
                            {review.ratings.overall}
                          </span>
                        </div>
                      </div>
                      {review.title && <p className="font-semibold" style={{ marginBottom: '0.375rem' }}>{review.title}</p>}
                      <p className="text-sm text-muted">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Restaurant Info */}
          <div>
            {/* Restaurant Info Card */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', position: 'sticky', top: '5rem' }}>
              <h3 className="font-semibold" style={{ marginBottom: '1rem' }}>Restaurant Info</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div className="flex items-start gap-3">
                  <MapPin size={16} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <p className="text-sm">{restaurant.address?.street}</p>
                    <p className="text-sm text-muted">{restaurant.address?.city}, {restaurant.address?.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <p className="text-sm">{restaurant.phone}</p>
                </div>
                {restaurant.deliveryInfo?.minOrderAmount > 0 && (
                  <div className="flex items-center gap-3">
                    <Truck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <p className="text-sm">Min. order: ₹{restaurant.deliveryInfo.minOrderAmount}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold text-muted" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available For</p>
                <div className="flex gap-2 flex-wrap">
                  {restaurant.features?.delivery && <span className="badge badge-info"><Truck size={10} /> Delivery</span>}
                  {restaurant.features?.dineIn && <span className="badge badge-success">🍽️ Dine-In</span>}
                  {restaurant.features?.tableReservation && <span className="badge badge-primary"><Calendar size={10} /> Reservation</span>}
                </div>
              </div>

              {/* View Cart Button if cart has items */}
              <button
                id="view-cart-btn"
                className="btn btn-primary w-full"
                style={{ marginTop: '1.25rem' }}
                onClick={() => setIsCartOpen(true)}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Modal */}
      {conflictModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400, padding: '2rem' }}>
            <h3 className="font-bold text-xl" style={{ marginBottom: '1rem' }}>⚠️ Cart Conflict</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{conflictModal.message}</p>
            <div className="flex gap-3">
              <button
                id="conflict-cancel-btn"
                className="btn btn-secondary flex-1"
                onClick={() => handleConflictResolve(false)}
              >
                Keep Current
              </button>
              <button
                id="conflict-clear-btn"
                className="btn btn-primary flex-1"
                onClick={() => handleConflictResolve(true)}
              >
                Clear & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
