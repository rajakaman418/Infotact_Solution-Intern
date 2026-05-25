import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';

const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'American', 'Burgers', 'Pizza', 'Thai', 'Mexican', 'Mughlai'];
const RATINGS = ['4.5+', '4.0+', '3.5+'];
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [minRating, setMinRating] = useState('');
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [useLocation, setUseLocationFilter] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const { addItem, setIsCartOpen } = useCart();

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      let endpoint = '/restaurants';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCuisines.length > 0) params.append('cuisine', selectedCuisines.join(','));
      if (minRating) params.append('minRating', parseFloat(minRating));
      if (selectedPrices.length > 0) params.append('priceRange', selectedPrices.join(','));
      params.append('page', page);
      params.append('limit', 12);

      if (useLocation && userCoords) {
        endpoint = '/restaurants/nearby';
        params.append('lat', userCoords.lat);
        params.append('lng', userCoords.lng);
        params.append('maxDistance', 15000); // 15km
      }

      const { data } = await api.get(`${endpoint}?${params}`);
      setRestaurants(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchRestaurants, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCuisines, minRating, selectedPrices, page, useLocation, userCoords]);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setUseLocationFilter(true);
        },
        (err) => console.error('Location error:', err)
      );
    }
  };

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
    setPage(1);
  };

  const togglePrice = (price) => {
    setSelectedPrices((prev) =>
      prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCuisines([]);
    setMinRating('');
    setSelectedPrices([]);
    setPage(1);
  };

  const activeFilterCount = selectedCuisines.length + (minRating ? 1 : 0) + selectedPrices.length;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="font-display font-bold text-4xl" style={{ marginBottom: '0.5rem' }}>
            Discover <span className="gradient-text">Restaurants</span>
          </h1>
          <p className="text-muted">Find the best food near you</p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: 240 }}>
            <Search size={16} className="input-icon" />
            <input
              id="restaurants-search"
              type="text"
              className="input"
              placeholder="Search restaurants, cuisines..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <button
            id="restaurants-location-btn"
            className={`btn ${useLocation ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
            onClick={handleGetLocation}
          >
            <MapPin size={16} />
            <span className="hide-mobile">{useLocation ? 'Nearby' : 'Near Me'}</span>
          </button>

          <button
            id="restaurants-filter-btn"
            className={`btn btn-secondary flex items-center gap-2 relative`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            <span className="hide-mobile">Filters</span>
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--primary)', color: 'white',
                width: 18, height: 18, borderRadius: '50%',
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Cuisine Quick Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              id={`cuisine-filter-${cuisine.toLowerCase().replace(/\s+/g, '-')}`}
              className={`tag ${selectedCuisines.includes(cuisine) ? 'active' : ''}`}
              onClick={() => toggleCuisine(cuisine)}
              style={{ flexShrink: 0 }}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="card animate-slideDown" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {/* Rating Filter */}
              <div className="form-group">
                <label className="form-label">Minimum Rating</label>
                <div className="flex gap-2 flex-wrap">
                  {RATINGS.map((r) => (
                    <button
                      key={r}
                      id={`rating-filter-${r}`}
                      className={`tag ${minRating === r.replace('+', '') ? 'active' : ''}`}
                      onClick={() => setMinRating(minRating === r.replace('+', '') ? '' : r.replace('+', ''))}
                    >
                      ⭐ {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="form-group">
                <label className="form-label">Price Range</label>
                <div className="flex gap-2 flex-wrap">
                  {PRICE_RANGES.map((p) => (
                    <button
                      key={p}
                      id={`price-filter-${p}`}
                      className={`tag ${selectedPrices.includes(p) ? 'active' : ''}`}
                      onClick={() => togglePrice(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button id="clear-filters-btn" className="btn btn-ghost text-sm" style={{ marginTop: '1rem', color: 'var(--error)' }} onClick={clearFilters}>
                <X size={14} /> Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} found
            {useLocation && ' · Sorted by distance & rating'}
          </p>
        )}

        {/* Restaurant Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card" style={{ height: 340 }}>
                <div className="skeleton" style={{ height: 200, borderRadius: '16px 16px 0 0' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div className="skeleton" style={{ height: 20, width: '70%', borderRadius: 8, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
            <h3 className="font-bold text-xl">No restaurants found</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Try adjusting your filters or search terms</p>
            <button id="reset-search-btn" className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={clearFilters}>Reset Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3" style={{ marginTop: '2.5rem' }}>
            <button
              id="prev-page-btn"
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="text-muted text-sm">Page {page} of {totalPages}</span>
            <button
              id="next-page-btn"
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
