import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ChefHat, Star, ArrowRight, MapPin } from 'lucide-react';
import api from '../api/axios';
import { joinOrderRoom, getSocket } from '../socket/socket';

const ORDER_STEPS = [
  { status: 'PENDING', label: 'Order Placed', icon: Package, color: 'var(--info)' },
  { status: 'ACCEPTED', label: 'Order Accepted', icon: CheckCircle, color: 'var(--success)' },
  { status: 'ORDER_PREPARING', label: 'Preparing Your Order', icon: ChefHat, color: 'var(--accent)' },
  { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: Package, color: 'var(--accent)' },
  { status: 'COURIER_ASSIGNED', label: 'Courier Assigned', icon: Truck, color: 'var(--primary)' },
  { status: 'IN_TRANSIT', label: 'On the Way', icon: Truck, color: 'var(--primary)' },
  { status: 'DELIVERED', label: 'Delivered!', icon: CheckCircle, color: 'var(--success)' },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'var(--info)', bg: 'rgba(59,130,246,0.15)' },
  ACCEPTED: { label: 'Accepted', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
  ORDER_PREPARING: { label: 'Preparing', color: 'var(--accent)', bg: 'rgba(255,184,0,0.15)' },
  READY_FOR_PICKUP: { label: 'Ready', color: 'var(--accent)', bg: 'rgba(255,184,0,0.15)' },
  COURIER_ASSIGNED: { label: 'Courier Assigned', color: 'var(--primary)', bg: 'var(--primary-glow)' },
  IN_TRANSIT: { label: 'In Transit', color: 'var(--primary)', bg: 'var(--primary-glow)' },
  DELIVERED: { label: 'Delivered', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
  COMPLETED: { label: 'Completed', color: 'var(--success)', bg: 'rgba(16,185,129,0.15)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--error)', bg: 'rgba(239,68,68,0.15)' },
  REJECTED: { label: 'Rejected', color: 'var(--error)', bg: 'rgba(239,68,68,0.15)' },
};

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState(null);
  const socketInitialized = useRef(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.data);
        setLiveStatus(data.data.status);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order || socketInitialized.current) return;
    socketInitialized.current = true;

    const token = localStorage.getItem('foodapp_token');
    if (!token) return;

    // Initialize socket and join order room
    import('../socket/socket').then(({ initSocket, joinOrderRoom, getSocket }) => {
      const socket = initSocket(token);
      joinOrderRoom(id);

      socket.on('ORDER_STATUS_UPDATE', (data) => {
        if (data.orderId === id || data.orderId === order._id) {
          setLiveStatus(data.status);
          setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
        }
      });
    });

    return () => {
      import('../socket/socket').then(({ leaveOrderRoom }) => leaveOrderRoom(id));
    };
  }, [order, id]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <p className="text-muted">Order not found.</p>
      <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1rem' }}>My Orders</Link>
    </div>
  );

  const currentStatus = liveStatus || order.status;
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === currentStatus);
  const isDelivery = order.type === 'delivery';
  const stepsToShow = isDelivery ? ORDER_STEPS : ORDER_STEPS.slice(0, 4);

  return (
    <div className="page">
      <div className="container-sm">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <p className="text-muted text-sm" style={{ marginBottom: '0.25rem' }}>Order #{order.orderNumber}</p>
          <h1 className="font-display font-bold text-3xl">Track Your Order</h1>
        </div>

        {/* Live Status Banner */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: statusConfig.bg,
          border: `1px solid ${statusConfig.color}40`,
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Current Status</p>
            <p className="font-bold text-xl" style={{ color: statusConfig.color }}>{statusConfig.label}</p>
          </div>
          {(currentStatus === 'ORDER_PREPARING' || currentStatus === 'IN_TRANSIT') && (
            <div style={{ textAlign: 'right' }}>
              <p className="text-sm text-muted">Estimated</p>
              <p className="font-bold" style={{ color: statusConfig.color }}>
                {order.restaurant?.deliveryInfo?.estimatedTime || 35} min
              </p>
            </div>
          )}
          {['PENDING', 'ACCEPTED', 'ORDER_PREPARING', 'IN_TRANSIT'].includes(currentStatus) && (
            <div className="animate-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: statusConfig.color }} />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Status Timeline */}
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 className="font-semibold" style={{ marginBottom: '1.5rem' }}>Order Progress</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {stepsToShow.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className={`order-status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`} style={{ paddingBottom: idx < stepsToShow.length - 1 ? '1.5rem' : 0 }}>
                      <div className="step-dot">
                        {isCompleted ? (
                          <CheckCircle size={18} color={isActive ? 'var(--primary)' : 'var(--success)'} />
                        ) : (
                          <Icon size={16} color="var(--text-muted)" />
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${!isCompleted ? 'text-muted' : ''}`} style={{ color: isActive ? step.color : undefined }}>
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="text-sm text-muted animate-pulse">In progress...</p>
                        )}
                        {isCompleted && !isActive && (
                          <p className="text-sm text-muted">Done</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write Review CTA */}
            {(currentStatus === 'DELIVERED' || currentStatus === 'COMPLETED') && !order.hasReview && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,69,0,0.08))',
                border: '1px solid rgba(255,184,0,0.3)',
                borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                  <Star size={20} color="var(--accent)" fill="var(--accent)" />
                  <h3 className="font-semibold">Share Your Experience!</h3>
                </div>
                <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
                  Earn loyalty points by leaving a detailed review. The more you write, the more you earn!
                </p>
                <Link
                  to={`/review/${order._id}`}
                  id="write-review-btn"
                  className="btn btn-primary"
                >
                  Write Review & Earn Points <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Restaurant */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 className="font-semibold text-sm text-muted" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restaurant</h3>
              <p className="font-bold">{order.restaurant?.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted" style={{ marginTop: '0.375rem' }}>
                <MapPin size={12} />
                <span>{order.restaurant?.address?.city}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 className="font-semibold text-sm text-muted" style={{ marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Ordered</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted">{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="divider" style={{ margin: '0.875rem 0' }} />
              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount?.toFixed(0)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 className="font-semibold text-sm text-muted" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.transactionId && (
                <p className="text-xs text-muted" style={{ marginTop: '0.5rem', wordBreak: 'break-all' }}>
                  TXN: {order.transactionId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
