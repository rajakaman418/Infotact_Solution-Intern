import { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Bell,
} from 'lucide-react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  initSocket,
  joinRestaurantRoom,
} from '../socket/socket';

import toast from 'react-hot-toast';

const MerchantDashboard = () => {
  const { user } = useAuth();

  // MULTI RESTAURANT SUPPORT
  const [restaurants, setRestaurants] = useState([]);
  const [restaurant, setRestaurant] =
    useState(null);

  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState('orders');

  const [newOrderAlert, setNewOrderAlert] =
    useState(null);

  // LOAD DATA
  const loadRestaurantData = async (
    restaurantId
  ) => {
    const [ordersRes, analyticsRes] =
      await Promise.all([
        api.get(
          `/orders/restaurant/${restaurantId}?limit=20`
        ),

        api.get(
          `/orders/restaurant/${restaurantId}/analytics`
        ),
      ]);

    setOrders(ordersRes.data.data || []);
    setAnalytics(analyticsRes.data.data);
  };

  // INITIAL LOAD
  useEffect(() => {
    const fetchData = async () => {
      try {

        // GET ALL RESTAURANTS
        const { data } = await api.get(
          '/restaurants'
        );

        const restaurantList =
          data.data || [];

        setRestaurants(restaurantList);

        // FIRST RESTAURANT
        const selectedRestaurant =
          restaurantList[0];

        if (!selectedRestaurant) {
          setLoading(false);
          return;
        }

        setRestaurant(selectedRestaurant);

        // LOAD ORDERS + ANALYTICS
        await loadRestaurantData(
          selectedRestaurant._id
        );

        // SOCKET
        const token =
          localStorage.getItem(
            'foodapp_token'
          );

        if (token) {
          const socket =
            initSocket(token);

          joinRestaurantRoom(
            selectedRestaurant._id
          );

          socket.on(
            'NEW_ORDER',
            async (orderData) => {

              setNewOrderAlert(
                orderData
              );

              toast.success(
                `🔔 New order #${orderData.orderNumber}!`,
                { duration: 5000 }
              );

              await loadRestaurantData(
                selectedRestaurant._id
              );
            }
          );
        }

      } catch (err) {
        console.error(
          'Dashboard error:',
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // SWITCH RESTAURANT
  const handleRestaurantChange =
    async (e) => {

      const selectedRestaurant =
        restaurants.find(
          (r) => r._id === e.target.value
        );

      if (!selectedRestaurant) return;

      setRestaurant(selectedRestaurant);

      await loadRestaurantData(
        selectedRestaurant._id
      );

      joinRestaurantRoom(
        selectedRestaurant._id
      );
    };

  // UPDATE ORDER STATUS
  const handleUpdateOrderStatus =
    async (orderId, status) => {

      try {

        await api.patch(
          `/orders/${orderId}/status`,
          { status }
        );

        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, status }
              : o
          )
        );

        toast.success(
          `Order ${
            status === 'ACCEPTED'
              ? 'accepted'
              : 'updated'
          }!`
        );

      } catch (err) {
        toast.error(
          'Failed to update order'
        );
      }
    };

  // TOGGLE MENU ITEM
  const handleToggleMenuItem =
    async (itemId) => {

      try {

        const { data } =
          await api.patch(
            `/restaurants/${restaurant._id}/menu/${itemId}/toggle`
          );

        setRestaurant((prev) => ({
          ...prev,
          menu: prev.menu.map((item) =>
            item._id === itemId
              ? {
                  ...item,
                  isAvailable:
                    data.data.isAvailable,
                }
              : item
          ),
        }));

        toast.success(
          'Menu item updated!'
        );

      } catch (err) {
        toast.error(
          'Failed to toggle item'
        );
      }
    };

  const STATUS_ACTIONS = {
    PENDING: [
      {
        label: 'Accept',
        status: 'ACCEPTED',
        style: 'btn-primary',
      },

      {
        label: 'Reject',
        status: 'REJECTED',
        style: 'btn-secondary',
      },
    ],

    ACCEPTED: [
      {
        label: 'Start Preparing',
        status: 'ORDER_PREPARING',
        style: 'btn-primary',
      },
    ],

    ORDER_PREPARING: [
      {
        label: 'Mark Ready',
        status: 'READY_FOR_PICKUP',
        style: 'btn-primary',
      },
    ],

    READY_FOR_PICKUP: [
      {
        label: 'Assign Courier',
        status: 'COURIER_ASSIGNED',
        style: 'btn-primary',
      },
    ],
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 0',
        }}
      >
        <p className="text-muted">
          No restaurant found.
        </p>
      </div>
    );
  }

  const totalRevenue =
    analytics?.summary?.totalRevenue ||
    0;

  const totalOrders =
    analytics?.summary?.totalOrders ||
    0;

  const avgOrderValue =
    analytics?.summary?.avgOrderValue ||
    0;

  const pendingOrders =
    orders.filter(
      (o) => o.status === 'PENDING'
    ).length;

  return (
    <div className="page">
      <div className="container">

        {/* HEADER */}
        <div
          className="flex items-center justify-between"
          style={{
            marginBottom: '2rem',
          }}
        >

          <div>

            {/* RESTAURANT SWITCHER */}
            <select
              value={restaurant?._id || ''}
              onChange={
                handleRestaurantChange
              }
              className="btn btn-secondary"
              style={{
                marginBottom: '1rem',
                padding:
                  '0.75rem 1rem',
              }}
            >
              {restaurants.map((r) => (
                <option
                  key={r._id}
                  value={r._id}
                >
                  {r.name}
                </option>
              ))}
            </select>

            <h1 className="font-display font-bold text-3xl">
              {restaurant.name}
            </h1>

            <p className="text-muted">
              Merchant Dashboard
            </p>

          </div>

          {newOrderAlert && (
            <div
              style={{
                background:
                  'var(--primary-glow)',

                border:
                  '1px solid var(--primary)',

                borderRadius:
                  'var(--radius-lg)',

                padding:
                  '0.875rem 1.25rem',

                display: 'flex',

                alignItems: 'center',

                gap: '0.75rem',

                animation:
                  'glow 1s infinite',
              }}
            >
              <Bell
                size={18}
                color="var(--primary)"
              />

              <div>
                <p className="font-bold text-sm">
                  New Order!
                </p>

                <p className="text-xs text-muted">
                  #
                  {
                    newOrderAlert.orderNumber
                  }
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setActiveTab(
                    'orders'
                  );

                  setNewOrderAlert(
                    null
                  );
                }}
              >
                View
              </button>
            </div>
          )}
        </div>

        {/* STATS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4, 1fr)',

            gap: '1rem',

            marginBottom: '2rem',
          }}
        >
          {[
            {
              label: 'Total Revenue',
              value: `₹${totalRevenue.toFixed(
                0
              )}`,
              icon: TrendingUp,
              color: 'var(--success)',
            },

            {
              label: 'Total Orders',
              value: totalOrders,
              icon: Package,
              color: 'var(--info)',
            },

            {
              label:
                'Avg Order Value',
              value: `₹${avgOrderValue.toFixed(
                0
              )}`,
              icon: BarChart3,
              color:
                'var(--accent)',
            },

            {
              label:
                'Pending Orders',
              value: pendingOrders,
              icon: Bell,
              color:
                pendingOrders > 0
                  ? 'var(--primary)'
                  : 'var(--text-muted)',
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="stat-card"
              >
                <div
                  className="flex items-center justify-between"
                  style={{
                    marginBottom:
                      '1rem',
                  }}
                >
                  <p className="text-sm text-muted font-medium">
                    {stat.label}
                  </p>

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${stat.color}20`,
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    <Icon
                      size={18}
                      color={stat.color}
                    />
                  </div>
                </div>

                <p
                  className="font-bold text-3xl"
                  style={{
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* TABS */}
        <div
          className="flex gap-2"
          style={{
            marginBottom: '1.5rem',
            borderBottom:
              '1px solid var(--border)',
            paddingBottom: '0.5rem',
          }}
        >
          {[
            {
              id: 'orders',
              label: `Orders ${
                pendingOrders > 0
                  ? `(${pendingOrders} pending)`
                  : ''
              }`,
            },

            {
              id: 'menu',
              label: `Menu (${
                restaurant.menu?.length || 0
              } items)`,
            },

            {
              id: 'analytics',
              label: 'Analytics',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm ${
                activeTab === tab.id
                  ? 'btn-primary'
                  : 'btn-ghost'
              }`}
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {orders.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 0',
                }}
              >
                <Package
                  size={48}
                  color="var(--text-muted)"
                  style={{
                    margin:
                      '0 auto 1rem',
                  }}
                />

                <p className="text-muted">
                  No orders yet
                </p>
              </div>
            ) : (
              orders.map((order) => {

                const actions =
                  STATUS_ACTIONS[
                    order.status
                  ] || [];

                const isActive = [
                  'PENDING',
                  'ACCEPTED',
                  'ORDER_PREPARING',
                ].includes(order.status);

                return (
                  <div
                    key={order._id}
                    className="card"
                    style={{
                      padding:
                        '1.25rem 1.5rem',
                    }}
                  >

                    <div
                      className="flex items-start justify-between"
                      style={{
                        marginBottom:
                          '0.875rem',
                      }}
                    >

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="font-bold">
                            #
                            {
                              order.orderNumber
                            }
                          </span>

                          <span
                            className={`badge ${
                              order.status ===
                              'PENDING'
                                ? 'badge-warning'
                                : order.status ===
                                  'REJECTED'
                                ? 'badge-error'
                                : 'badge-success'
                            }`}
                          >
                            {order.status}
                          </span>

                          {isActive && (
                            <span
                              className="animate-pulse"
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius:
                                  '50%',
                                background:
                                  'var(--primary)',
                                display:
                                  'inline-block',
                              }}
                            />
                          )}
                        </div>

                        <p
                          className="text-sm text-muted"
                          style={{
                            marginTop:
                              '0.25rem',
                          }}
                        >
                          {
                            order.user
                              ?.name
                          }{' '}
                          ·{' '}
                          {
                            order.type
                          }{' '}
                          ·{' '}
                          {
                            order.items
                              ?.length
                          }{' '}
                          items
                        </p>

                      </div>

                      <div
                        style={{
                          textAlign:
                            'right',
                        }}
                      >
                        <p
                          className="font-bold text-xl"
                          style={{
                            color:
                              'var(--primary)',
                          }}
                        >
                          ₹
                          {order.totalAmount?.toFixed(
                            0
                          )}
                        </p>

                        <p className="text-xs text-muted">
                          {new Date(
                            order.createdAt
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* ITEMS */}
                    <div
                      className="flex gap-2 flex-wrap"
                      style={{
                        marginBottom:
                          '0.875rem',
                      }}
                    >
                      {order.items?.map(
                        (item, i) => (
                          <span
                            key={i}
                            className="badge badge-muted"
                          >
                            {
                              item.name
                            }{' '}
                            ×
                            {
                              item.quantity
                            }
                          </span>
                        )
                      )}
                    </div>

                    {/* ACTIONS */}
                    {actions.length >
                      0 && (
                      <div className="flex gap-2">
                        {actions.map(
                          (
                            action
                          ) => (
                            <button
                              key={
                                action.status
                              }
                              className={`btn btn-sm ${action.style}`}
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order._id,
                                  action.status
                                )
                              }
                            >
                              {
                                action.label
                              }
                            </button>
                          )
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MerchantDashboard;