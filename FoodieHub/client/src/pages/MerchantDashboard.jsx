import { useState, useEffect } from 'react';
import { BarChart3, Package, TrendingUp, Users, ToggleLeft, ToggleRight, Check, X, Bell } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { initSocket, joinRestaurantRoom } from '../socket/socket';
import toast from 'react-hot-toast';

const MerchantDashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/restaurants/my-restaurant');
        setRestaurant(data.data);

        const [ordersRes, analyticsRes] = await Promise.all([
          api.get(`/orders/restaurant/${data.data._id}?limit=20`),
          api.get(`/orders/restaurant/${data.data._id}/analytics`),
        ]);
        setOrders(ordersRes.data.data || []);
        setAnalytics(analyticsRes.data.data);

        // Setup WebSocket for new orders
        const token = localStorage.getItem('foodapp_token');
        if (token) {
          const socket = initSocket(token);
          joinRestaurantRoom(data.data._id);
          socket.on('NEW_ORDER', (orderData) => {
            setNewOrderAlert(orderData);
            toast.success(`🔔 New order #${orderData.orderNumber}!`, { duration: 5000 });
            // Refresh orders
            api.get(`/orders/restaurant/${data.data._id}?limit=20`).then((r) => setOrders(r.data.data || []));
          });
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status } : o)
      );
      toast.success(`Order ${status === 'ACCEPTED' ? 'accepted' : 'updated'}!`);
    } catch (err) {
      toast.error('Failed to update order');
    }
  };

  const handleToggleMenuItem = async (itemId) => {
    try {
      const { data } = await api.patch(`/restaurants/${restaurant._id}/menu/${itemId}/toggle`);
      setRestaurant((prev) => ({
        ...prev,
        menu: prev.menu.map((item) =>
          item._id === itemId ? { ...item, isAvailable: data.data.isAvailable } : item
        ),
      }));
      toast.success('Menu item updated!');
    } catch (err) {
      toast.error('Failed to toggle item');
    }
  };

  const STATUS_ACTIONS = {
    PENDING: [
      { label: 'Accept', status: 'ACCEPTED', style: 'btn-primary' },
      { label: 'Reject', status: 'REJECTED', style: 'btn-secondary' },
    ],
    ACCEPTED: [{ label: 'Start Preparing', status: 'ORDER_PREPARING', style: 'btn-primary' }],
    ORDER_PREPARING: [{ label: 'Mark Ready', status: 'READY_FOR_PICKUP', style: 'btn-primary' }],
    READY_FOR_PICKUP: [{ label: 'Assign Courier', status: 'COURIER_ASSIGNED', style: 'btn-primary' }],
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (!restaurant) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <p className="text-muted">No restaurant found. Create one first.</p>
    </div>
  );

  const totalRevenue = analytics?.summary?.totalRevenue || 0;
  const totalOrders = analytics?.summary?.totalOrders || 0;
  const avgOrderValue = analytics?.summary?.avgOrderValue || 0;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="font-display font-bold text-3xl">{restaurant.name}</h1>
            <p className="text-muted">Merchant Dashboard</p>
          </div>
          {newOrderAlert && (
            <div style={{
              background: 'var(--primary-glow)', border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-lg)', padding: '0.875rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              animation: 'glow 1s infinite',
            }}>
              <Bell size={18} color="var(--primary)" />
              <div>
                <p className="font-bold text-sm">New Order!</p>
                <p className="text-xs text-muted">#{newOrderAlert.orderNumber}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setActiveTab('orders'); setNewOrderAlert(null); }}>
                View
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'var(--success)' },
            { label: 'Total Orders', value: totalOrders, icon: Package, color: 'var(--info)' },
            { label: 'Avg Order Value', value: `₹${avgOrderValue.toFixed(0)}`, icon: BarChart3, color: 'var(--accent)' },
            { label: 'Pending Orders', value: pendingOrders, icon: Bell, color: pendingOrders > 0 ? 'var(--primary)' : 'var(--text-muted)' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                  <p className="text-sm text-muted font-medium">{stat.label}</p>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={stat.color} />
                  </div>
                </div>
                <p className="font-bold text-3xl" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          {[
            { id: 'orders', label: `Orders ${pendingOrders > 0 ? `(${pendingOrders} pending)` : ''}` },
            { id: 'menu', label: `Menu (${restaurant.menu?.length || 0} items)` },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`dashboard-tab-${tab.id}`}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <p className="text-muted">No orders yet</p>
              </div>
            ) : orders.map((order) => {
              const actions = STATUS_ACTIONS[order.status] || [];
              const isActive = ['PENDING', 'ACCEPTED', 'ORDER_PREPARING'].includes(order.status);

              return (
                <div key={order._id} id={`dashboard-order-${order._id}`} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="flex items-start justify-between" style={{ marginBottom: '0.875rem' }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">#{order.orderNumber}</span>
                        <span className={`badge ${order.status === 'PENDING' ? 'badge-warning' : order.status === 'REJECTED' ? 'badge-error' : 'badge-success'}`}>
                          {order.status}
                        </span>
                        {isActive && <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                      </div>
                      <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                        {order.user?.name} · {order.type} · {order.items?.length} items
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="font-bold text-xl" style={{ color: 'var(--primary)' }}>₹{order.totalAmount?.toFixed(0)}</p>
                      <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex gap-2 flex-wrap" style={{ marginBottom: '0.875rem' }}>
                    {order.items?.map((item, i) => (
                      <span key={i} className="badge badge-muted">{item.name} ×{item.quantity}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  {actions.length > 0 && (
                    <div className="flex gap-2">
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          id={`order-action-${order._id}-${action.status}`}
                          className={`btn btn-sm ${action.style}`}
                          onClick={() => handleUpdateOrderStatus(order._id, action.status)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {restaurant.menu?.map((item) => (
              <div key={item._id} id={`menu-toggle-${item._id}`} className="card" style={{ padding: '1.25rem', opacity: item.isAvailable ? 1 : 0.6 }}>
                <div className="flex items-start justify-between">
                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: item.isVeg ? '50%' : 2, flexShrink: 0,
                        background: item.isVeg ? 'var(--success)' : 'var(--error)',
                      }} />
                      <p className="font-semibold text-sm">{item.name}</p>
                    </div>
                    <p className="text-xs text-muted" style={{ marginBottom: '0.5rem' }}>{item.category}</p>
                    <p className="font-bold" style={{ color: 'var(--primary)' }}>₹{item.price}</p>
                  </div>
                  <button
                    className={`btn btn-sm ${item.isAvailable ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleToggleMenuItem(item._id)}
                    style={{ flexShrink: 0 }}
                  >
                    {item.isAvailable ? (
                      <><ToggleRight size={16} /> Available</>
                    ) : (
                      <><ToggleLeft size={16} /> Unavailable</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 className="font-semibold" style={{ marginBottom: '1.5rem' }}>Daily Revenue (Last 7 Days)</h3>
              {analytics.daily?.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No completed orders yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analytics.daily?.map((day) => {
                    const maxRevenue = Math.max(...analytics.daily.map((d) => d.revenue));
                    const pct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={day._id}>
                        <div className="flex justify-between text-sm" style={{ marginBottom: '0.3rem' }}>
                          <span className="text-muted">{day._id}</span>
                          <span className="font-semibold">₹{day.revenue.toFixed(0)} ({day.orders} orders)</span>
                        </div>
                        <div className="review-progress">
                          <div className="review-progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 className="font-semibold" style={{ marginBottom: '1.5rem' }}>All-Time Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { label: 'Total Revenue', value: `₹${(analytics.summary?.totalRevenue || 0).toFixed(0)}`, color: 'var(--success)' },
                  { label: 'Total Orders', value: analytics.summary?.totalOrders || 0, color: 'var(--info)' },
                  { label: 'Average Order Value', value: `₹${(analytics.summary?.avgOrderValue || 0).toFixed(0)}`, color: 'var(--accent)' },
                  { label: 'Menu Items', value: restaurant.menu?.length || 0, color: 'var(--primary)' },
                  { label: 'Restaurant Rating', value: `${restaurant.rating?.toFixed(1) || 'N/A'} ⭐`, color: 'var(--accent)' },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center" style={{ paddingBottom: '0.875rem', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-muted text-sm">{stat.label}</span>
                    <span className="font-bold text-xl" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;
