import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrdersPage from './pages/OrdersPage';
import ReviewPage from './pages/ReviewPage';
import MerchantDashboard from './pages/MerchantDashboard';
import AuthPages from './pages/AuthPages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                <Route path="/login" element={<AuthPages mode="login" />} />
                <Route path="/register" element={<AuthPages mode="register" />} />
                <Route path="/events" element={<RestaurantsPage />} />

                {/* Protected Routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderTrackingPage />
                  </ProtectedRoute>
                } />
                <Route path="/review/:orderId" element={
                  <ProtectedRoute>
                    <ReviewPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute roles={['restaurant', 'admin']}>
                    <MerchantDashboard />
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={
                  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem' }}>🍽️</div>
                    <h2 className="font-bold text-2xl">Page not found</h2>
                    <p className="text-muted">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn btn-primary">Go Home</a>
                  </div>
                } />
              </Routes>
            </main>

            {/* Cart Sidebar */}
            <CartSidebar />

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                },
                success: {
                  iconTheme: { primary: 'var(--success)', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: 'var(--error)', secondary: 'white' },
                },
              }}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
