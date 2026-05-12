import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ChefHat, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'consumer', label: '🍽️ Food Lover', desc: 'Order food & make reservations' },
  { value: 'restaurant', label: '🏪 Restaurant Owner', desc: 'Manage your restaurant' },
  { value: 'courier', label: '🛵 Delivery Courier', desc: 'Make deliveries' },
];

const AuthPages = ({ mode }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'consumer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('consumer');

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = isLogin
      ? await login(formData.email, formData.password)
      : await register({ ...formData, role: selectedRole });

    setLoading(false);

    if (result.success) {
      toast.success(isLogin ? 'Welcome back! 🎉' : 'Account created! 🎉');
      navigate(result.user?.role === 'restaurant' ? '/dashboard' : '/restaurants');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--bg-base)' }}>
      {/* Background decorative */}
      <div style={{ position: 'fixed', top: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,69,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FF4500, #FFB800)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(255,69,0,0.4)' }}>
              <ChefHat size={24} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-2xl gradient-text">FoodieHub</span>
          </Link>
          <h1 className="font-display font-bold text-3xl" style={{ marginBottom: '0.375rem' }}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-muted">
            {isLogin
              ? "Sign in to your FoodieHub account"
              : "Join thousands of food lovers today"}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form id={`${mode}-form`} onSubmit={handleSubmit}>
            {/* Role Selector (Register only) */}
            {!isLogin && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p className="form-label" style={{ marginBottom: '0.75rem' }}>I am a...</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      id={`role-${role.value}`}
                      onClick={() => { setSelectedRole(role.value); handleChange('role', role.value); }}
                      style={{
                        padding: '0.875rem 0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        border: `2px solid ${selectedRole === role.value ? 'var(--primary)' : 'var(--border)'}`,
                        background: selectedRole === role.value ? 'var(--primary-glow)' : 'var(--bg-elevated)',
                        transition: 'all var(--transition)', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{role.label.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: selectedRole === role.value ? 'var(--primary)' : 'var(--text-secondary)' }}>
                        {role.label.split(' ').slice(1).join(' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name (Register only) */}
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    id="register-name"
                    type="text"
                    className="input"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id={`${mode}-email`}
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone (Register only) */}
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Phone (Optional)</label>
                <div className="input-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input
                    id="register-phone"
                    type="tel"
                    className="input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.375rem' }}>
                <label className="form-label">Password</label>
                {isLogin && <Link to="/forgot-password" className="text-xs" style={{ color: 'var(--primary)' }}>Forgot password?</Link>}
              </div>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id={`${mode}-password`}
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id={`${mode}-submit-btn`}
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18 }} /> {isLogin ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Demo Account */}
          {isLogin && (
            <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold text-muted" style={{ marginBottom: '0.5rem' }}>Demo Accounts:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  { label: 'Consumer', email: 'user@foodapp.com', password: 'password123' },
                  { label: 'Restaurant', email: 'owner@foodapp.com', password: 'password123' },
                ].map((demo) => (
                  <button
                    key={demo.label}
                    className="text-xs text-muted"
                    style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem 0' }}
                    onClick={() => {
                      handleChange('email', demo.email);
                      handleChange('password', demo.password);
                    }}
                  >
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{demo.label}:</span> {demo.email} / {demo.password}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="divider" style={{ margin: '1.5rem 0' }} />
          <p className="text-center text-muted text-sm">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              to={isLogin ? '/register' : '/login'}
              id={isLogin ? 'goto-register' : 'goto-login'}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
