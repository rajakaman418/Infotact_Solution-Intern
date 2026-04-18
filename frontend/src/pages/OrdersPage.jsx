import { useEffect, useState } from "react";
import AppShell from "../components/layout/AppShell";
import Topbar from "../components/layout/Topbar";
import { getOrders, refundOrder } from "../api/order.api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refundingId, setRefundingId] = useState("");

  useEffect(() => {
    loadOrders(page, status, startDate, endDate);
  }, [page]);

  const loadOrders = async (
    customPage = page,
    customStatus = status,
    customStartDate = startDate,
    customEndDate = endDate
  ) => {
    try {
      setLoading(true);

      const params = {
        page: customPage,
        limit: 10,
      };

      if (customStatus) params.status = customStatus;
      if (customStartDate) params.startDate = customStartDate;
      if (customEndDate) params.endDate = customEndDate;

      const data = await getOrders(params);

      setOrders(data.items || []);
      setPagination(data.pagination || null);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setPage(1);
    await loadOrders(1, status, startDate, endDate);
  };

  const clearFilters = async () => {
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    await loadOrders(1, "", "", "");
  };

  const handleRefund = async (orderId) => {
    const confirmed = window.confirm("Are you sure you want to refund this order?");
    if (!confirmed) return;

    try {
      setRefundingId(orderId);
      await refundOrder(orderId);
      alert("Order refunded successfully");
      await loadOrders(page, status, startDate, endDate);
    } catch (error) {
      alert(error?.response?.data?.message || "Refund failed");
    } finally {
      setRefundingId("");
    }
  };

  return (
    <AppShell>
      <Topbar title="Orders" subtitle="Track sales, refunds, and filter by date" />

      <div className="panel">
        <div className="orders-toolbar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button className="primary-btn" onClick={applyFilters}>
            Apply
          </button>

          <button className="secondary-btn" onClick={clearFilters}>
            Clear
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading orders...</h3>
          </div>
        ) : !orders.length ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>Try changing the status or date filters.</p>
          </div>
        ) : (
          <div className="order-table">
            <div className="order-table-head orders-grid">
              <span>Order</span>
              <span>Status</span>
              <span>Total</span>
              <span>Created</span>
              <span>Action</span>
            </div>

            {orders.map((order) => (
              <div className="order-table-row orders-grid" key={order._id}>
                <span>{order.orderNumber}</span>

                <span className={`status-pill status-${order.status}`}>
                  {order.status}
                </span>

                <span>₹ {order.grandTotal}</span>

                <span>{new Date(order.createdAt).toLocaleString()}</span>

                <span>
                  {order.status === "completed" ? (
                    <button
                      className="refund-btn"
                      onClick={() => handleRefund(order._id)}
                      disabled={refundingId === order._id}
                    >
                      {refundingId === order._id ? "Refunding..." : "Refund"}
                    </button>
                  ) : (
                    <span className="muted-text">—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {pagination && (
          <div className="pagination-bar">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </button>

            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}