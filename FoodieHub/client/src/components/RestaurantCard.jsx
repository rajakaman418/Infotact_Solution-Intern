import { Star, MapPin, Clock, Truck, Zap, Check, Leaf, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const {
    _id, name, description, cuisineType, image, coverImage,
    rating, totalRatings, priceRange, deliveryInfo, features,
    distance, isVerified,
  } = restaurant;

  const distanceKm = distance ? (distance / 1000).toFixed(1) : null;

  const renderStars = (r) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} size={12} fill={i < Math.floor(r) ? 'currentColor' : 'none'} strokeWidth={i < Math.floor(r) ? 0 : 1.5} />
    ));
  };

  return (
    <Link to={`/restaurants/${_id}`} id={`restaurant-card-${_id}`} style={{ display: 'block' }}>
      <div className="card card-interactive restaurant-card">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img
            src={coverImage || image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600`}
            alt={name}
            className="card-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600`; }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
          }} />

          {/* Badges */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.375rem' }}>
            {isVerified && (
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                <Check size={9} /> Verified
              </span>
            )}
            {features?.delivery && (
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                <Truck size={9} /> Delivery
              </span>
            )}
          </div>

          {/* Price & Distance */}
          <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.375rem' }}>
            {distanceKm && (
              <span className="distance-badge">
                <MapPin size={10} style={{ display: 'inline', marginRight: 2 }} />{distanceKm} km
              </span>
            )}
            <span className="distance-badge">{priceRange}</span>
          </div>
        </div>

        {/* Body */}
        <div className="card-body">
          <div className="flex justify-between items-start" style={{ marginBottom: '0.375rem' }}>
            <h3 className="font-display font-bold text-lg" style={{ lineHeight: 1.2 }}>{name}</h3>
            <div className="flex items-center gap-1 stars" style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
              {renderStars(rating)}
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)', marginLeft: '0.25rem' }}>
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5" style={{ marginBottom: '0.75rem' }}>
            {cuisineType?.slice(0, 3).map((c) => (
              <span key={c} className="text-xs text-muted">{c}</span>
            )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`dot-${i}`} className="text-muted">·</span>, el], [])}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {features?.delivery && deliveryInfo && (
                <>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock size={12} />
                    <span>{deliveryInfo.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Truck size={12} />
                    <span>{deliveryInfo.deliveryFee > 0 ? `₹${deliveryInfo.deliveryFee}` : 'Free'}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} color="var(--accent)" />
              <span className="text-xs text-muted">{totalRatings || 0} reviews</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
