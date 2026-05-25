import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, MapPin, Menu, X, ChefHat, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/restaurants', label: 'Restaurants' },
    { to: '/events', label: 'Events' },
    { to: '/orders', label: 'My Orders' },
  ];

  if (user?.role === 'restaurant') {
    navLinks.push({ to: '/dashboard', label: 'Dashboard' });
  }

  return (
    <nav className="navbar">
      <div className="container h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" id="nav-logo" className="flex items-center gap-2">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #FF4500, #FFB800)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255,69,0,0.4)',
          }}>
            <ChefHat size={20} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-lg" style={{ lineHeight: 1 }}>
              <span className="gradient-text">FoodieHub</span>
            </div>
            <div className="text-xs text-muted" style={{ lineHeight: 1, marginTop: 1 }}>Deliver · Dine · Discover</div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="flex items-center gap-1 hide-mobile">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`nav-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Cart Button */}
          <button
            id="navbar-cart-btn"
            className="btn btn-ghost btn-icon relative"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--primary)', color: 'white',
                width: 18, height: 18, borderRadius: '50%',
                fontSize: '0.6875rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'fadeIn 0.2s ease',
              }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="relative">
              <button
                id="navbar-user-btn"
                className="flex items-center gap-2 btn btn-ghost"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ padding: '0.4rem 0.75rem' }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: 'white',
                }}>
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="font-medium text-sm hide-mobile">{user.name?.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <div
                  className="card animate-slideDown"
                  style={{
                    position: 'absolute', right: 0, top: '110%',
                    minWidth: 200, zIndex: 600, padding: '0.5rem',
                  }}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  {/* User Points */}
                  <div style={{
                    padding: '0.625rem 0.875rem', marginBottom: '0.25rem',
                    background: 'linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,69,0,0.08))',
                    borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Zap size={14} color="var(--accent)" />
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                      {user.loyaltyPoints || 0} Points
                    </span>
                  </div>
                  {[
                    { to: '/profile', label: 'My Profile', id: 'nav-profile' },
                    { to: '/orders', label: 'My Orders', id: 'nav-orders' },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      id={item.id}
                      className="flex items-center gap-2 nav-link w-full"
                      style={{ borderRadius: 8, padding: '0.5rem 0.75rem' }}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="divider" style={{ margin: '0.375rem 0' }} />
                  <button
                    id="nav-logout"
                    onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                    className="btn btn-ghost w-full text-sm"
                    style={{ justifyContent: 'flex-start', padding: '0.5rem 0.75rem', color: 'var(--error)' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" id="nav-login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" id="nav-register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="navbar-mobile-menu-btn"
            className="btn btn-ghost btn-icon"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="card animate-slideDown" style={{
          position: 'absolute', top: '4rem', left: 0, right: 0,
          borderRadius: 0, borderTop: '1px solid var(--border)', padding: '1rem',
          zIndex: 499,
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link w-full"
              style={{ padding: '0.75rem 1rem', display: 'block' }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
