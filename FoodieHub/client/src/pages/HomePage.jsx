import { useState, useEffect } from 'react';
import { Search, MapPin, Truck, Star, Zap, ArrowRight, ChefHat, Calendar, Clock, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RestaurantCard from '../components/RestaurantCard';

const CUISINE_EMOJIS = {
  'North Indian': '🍛', 'South Indian': '🥘', 'Chinese': '🥡',
  'Italian': '🍝', 'American': '🍔', 'Burgers': '🍔', 'Pizza': '🍕',
  'Thai': '🍜', 'Mexican': '🌮', 'Mughlai': '🍖',
};

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const { data } = await api.get('/restaurants?limit=6');
        setTopRestaurants(data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchTop();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/restaurants?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-hero" style={{ padding: '5rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,69,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,184,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container">
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-glow)', border: '1px solid rgba(255,69,0,0.3)', animation: 'fadeIn 0.6s ease' }}>
              <Zap size={14} color="var(--primary)" />
              <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Food · Dine · Discover — All in One</span>
            </div>

            <h1 className="font-display font-extrabold" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1, marginBottom: '1.25rem', animation: 'slideUp 0.6s ease' }}>
              The Future of{' '}
              <span className="gradient-text">Dining</span>{' '}
              is Here
            </h1>

            <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: 480, margin: '0 auto 2.5rem', animation: 'slideUp 0.7s ease' }}>
              Order delivery, book tables, discover events, and earn rewards — all from one unified platform.
            </p>

            {/* Search Bar */}
            <form id="hero-search-form" onSubmit={handleSearch} style={{ animation: 'slideUp 0.8s ease' }}>
              <div style={{
                display: 'flex', background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: 600, margin: '0 auto',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '0.625rem', flex: 1 }}>
                  <Search size={20} color="var(--primary)" />
                  <input
                    id="hero-search-input"
                    type="text"
                    placeholder="Search restaurants, cuisines, dishes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', width: '100%', padding: '1.125rem 0' }}
                  />
                </div>
                <button
                  id="hero-search-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ margin: '0.5rem', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1.5rem' }}
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Tags */}
            <div className="flex gap-2 justify-center flex-wrap" style={{ marginTop: '1.5rem', animation: 'fadeIn 1s ease' }}>
              {['Pizza', 'Biryani', 'Burger', 'Chinese', 'South Indian'].map((tag) => (
                <button
                  key={tag}
                  className="tag"
                  onClick={() => navigate(`/restaurants?search=${tag}`)}
                >
                  {CUISINE_EMOJIS[tag] || '🍽️'} {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section style={{ padding: '2rem 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Real-time GPS tracking', color: 'var(--primary)' },
              { icon: Calendar, title: 'Table Reservations', desc: 'Book instantly, dine perfectly', color: 'var(--info)' },
              { icon: Star, title: 'Earn Rewards', desc: 'Points for every review', color: 'var(--accent)' },
              { icon: Users, title: 'Events', desc: 'Discover live dining events', color: 'var(--success)' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-center gap-3">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${feature.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} color={feature.color} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{feature.title}</p>
                    <p className="text-xs text-muted">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header flex justify-between items-center">
            <div>
              <h2 className="section-title">Browse by Cuisine</h2>
              <p className="section-subtitle">Find your favorite food style</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
            {Object.entries(CUISINE_EMOJIS).map(([cuisine, emoji]) => (
              <Link
                key={cuisine}
                to={`/restaurants?cuisine=${encodeURIComponent(cuisine)}`}
                id={`home-cuisine-${cuisine.toLowerCase().replace(/\s+/g, '-')}`}
                className="card card-interactive"
                style={{ padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{emoji}</div>
                <p className="text-sm font-semibold">{cuisine}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Restaurants */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="section-header flex justify-between items-center">
            <div>
              <h2 className="section-title">Top Restaurants</h2>
              <p className="section-subtitle">Highly rated by our community</p>
            </div>
            <Link to="/restaurants" id="home-see-all-btn" className="btn btn-outline btn-sm flex items-center gap-1">
              See All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card" style={{ height: 320 }}>
                  <div className="skeleton" style={{ height: 200, borderRadius: '16px 16px 0 0' }} />
                  <div style={{ padding: '1rem' }}>
                    <div className="skeleton" style={{ height: 18, width: '70%', borderRadius: 8, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: '50%', borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {topRestaurants.map((r) => <RestaurantCard key={r._id} restaurant={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How FoodieHub Works</h2>
            <p className="section-subtitle">Simple, fast, rewarding</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginTop: '1rem' }}>
            {[
              { step: '01', icon: '🔍', title: 'Discover', desc: 'Find restaurants nearby using our geospatial search engine with cuisine and rating filters.' },
              { step: '02', icon: '🛒', title: 'Order or Reserve', desc: 'Add items to cart for delivery, or book a table reservation — all from one unified checkout.' },
              { step: '03', icon: '⭐', title: 'Review & Earn', desc: 'Write detailed reviews to earn loyalty points and unlock exclusive badges and rewards.' },
            ].map((item) => (
              <div key={item.step} className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
                <div className="font-display font-bold gradient-text" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  STEP {item.step}
                </div>
                <h3 className="font-bold text-xl" style={{ marginBottom: '0.75rem' }}>{item.title}</h3>
                <p className="text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, rgba(255,69,0,0.1), rgba(255,184,0,0.06))', borderTop: '1px solid rgba(255,69,0,0.15)' }}>
        <div className="container text-center">
          <h2 className="font-display font-bold text-4xl" style={{ marginBottom: '1rem' }}>
            Ready to <span className="gradient-text">Eat?</span>
          </h2>
          <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
            Join thousands of food lovers who've discovered a better way to dine.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" id="home-cta-register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/restaurants" id="home-cta-explore" className="btn btn-secondary btn-lg">
              Explore Restaurants
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
