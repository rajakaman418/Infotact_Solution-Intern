import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight, Star } from 'lucide-react';
import api from '../api/axios';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'var(--info)' },
  ACCEPTED: { label: 'Accepted', color: 'var(--success)' },
  ORDER_PREPARING: { label: 'Preparing', color: 'var(--accent)' },
  READY_FOR_PICKUP: { label: 'Ready', color: 'var(--accent)' },
  COURIER_ASSIGNED: { label: 'Assigned', color: 'var(--primary)' },
  IN_TRANSIT: { label: 'In Transit', color: 'var(--primary)' },
  DELIVERED: { label: 'Delivered', color: 'var(--success)' },
  COMPLETED: { label: 'Completed', color: 'var(--success)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--error)' },
  REJECTED: { label: 'Rejected', color: 'var(--error)' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 10 });
        if (statusFilter) params.append('status', statusFilter);
        const { data } = await api.get(`/orders?${params}`);
        setOrders(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter, page]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page">
      <div className="container-sm">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="font-display font-bold text-3xl" style={{ marginBottom: '0.5rem' }}>My Orders</h1>
          <p className="text-muted">Track and manage all your orders</p>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { value: '', label: 'All Orders' },
            { value: 'PENDING', label: 'Active' },
            { value: 'IN_TRANSIT', label: 'In Transit' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ].map((filter) => (
            <button
              key={filter.value}
              id={`orders-filter-${filter.value || 'all'}`}
              className={`btn btn-sm ${statusFilter === filter.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexShrink: 0, borderRadius: 'var(--radius-full)' }}
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <div className="skeleton" style={{ height: 20, width: '60%', borderRadius: 8, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 14, width: '40%', borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <h3 className="font-bold text-xl">No orders yet</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Start ordering from your favorite restaurants!</p>
            <Link to="/restaurants" id="orders-explore-btn" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const isActive = ['PENDING', 'ACCEPTED', 'ORDER_PREPARING', 'READY_FOR_PICKUP', 'COURIER_ASSIGNED', 'IN_TRANSIT'].includes(order.status);
              const canReview = ['DELIVERED', 'COMPLETED'].includes(order.status) && !order.hasReview;

              return (
                <div key={order._id} id={`order-card-${order._id}`} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="flex items-start justify-between" style={{ marginBottom: '0.875rem' }}>
                    <div>
                      <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                        <span className="font-bold text-sm">#{order.orderNumber}</span>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: `${sc.color}20`, color: sc.color, fontWeight: 600, border: `1px solid ${sc.color}40` }}>
                          {sc.label}
                        </span>
                        {isActive && <span className="animate-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: sc.color, display: 'inline-block' }} />}
                      </div>
                      <p className="font-semibold">{order.restaurant?.name}</p>
                      <p className="text-sm text-muted" style={{ marginTop: '0.125rem' }}>
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · ₹{order.totalAmount?.toFixed(0)} · {order.type}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="text-sm text-muted">{formatDate(order.createdAt)}</p>
                      <p className="font-bold" style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>₹{order.totalAmount?.toFixed(0)}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link
                      to={`/orders/${order._id}`}
                      id={`track-order-${order._id}`}
                      className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {isActive ? <>Track Order <ChevronRight size={14} /></> : 'View Details'}
                    </Link>

                    {canReview && (
                      <Link
                        to={`/review/${order._id}`}
                        id={`review-order-${order._id}`}
                        className="btn btn-sm btn-outline flex items-center gap-1"
                      >
                        <Star size={13} /> Write Review & Earn Points
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3" style={{ marginTop: '2rem' }}>
            <button id="orders-prev-btn" className="btn btn-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span className="text-muted text-sm">Page {page} of {totalPages}</span>
            <button id="orders-next-btn" className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
