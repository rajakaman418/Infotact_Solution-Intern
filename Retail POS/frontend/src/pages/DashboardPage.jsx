import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import AppShell from "../components/layout/AppShell";
import Topbar from "../components/layout/Topbar";
import StatCard from "../components/dashboard/StatCard";
import { getDashboard } from "../api/dashboard.api";
import { getSalesReport } from "../api/report.api";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [dashboardData, reportData] = await Promise.all([
        getDashboard(),
        getSalesReport(),
      ]);

      setDashboard(dashboardData);
      setSalesReport(reportData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
      if (!silent) {
        alert(error?.response?.data?.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const intervalId = setInterval(() => {
      loadData(true);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadData]);

  const dailySalesChartData =
    salesReport?.dailySales?.map((item) => ({
      date: `${item._id.day}/${item._id.month}`,
      revenue: item.revenue,
      orders: item.orders,
    })) || [];

  const topProductsChartData =
    salesReport?.topProducts?.map((item) => ({
      sku: item.sku,
      quantity: item.totalQuantity,
      revenue: item.totalRevenue,
    })) || [];

  return (
    <AppShell>
      <Topbar
        title="Dashboard"
        subtitle="Sales summary, charts, and inventory visibility"
      />

      <div className="dashboard-status-bar">
        <span>
          Last updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleTimeString() : "Not loaded yet"}
        </span>

        <div className="dashboard-status-actions">
          {refreshing && <span className="refresh-badge">Refreshing...</span>}
          <button className="secondary-btn" onClick={() => loadData(true)}>
            Refresh Now
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <h3>Loading dashboard...</h3>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Total Revenue"
              value={`₹ ${dashboard?.totalRevenue || 0}`}
              subtitle="All completed orders"
            />
            <StatCard
              title="Total Orders"
              value={dashboard?.totalOrders || 0}
              subtitle="Processed transactions"
            />
            <StatCard
              title="Today Revenue"
              value={`₹ ${dashboard?.todayRevenue || 0}`}
              subtitle="Today's completed sales"
            />
            <StatCard
              title="Low Stock Count"
              value={dashboard?.lowStockCount || 0}
              subtitle="Items at reorder threshold"
            />
          </div>

          <div className="dashboard-grid">
            <div className="panel chart-panel">
              <div className="panel-head">
                <h3>Daily Sales Trend</h3>
                <p>Revenue over time</p>
              </div>

              {!dailySalesChartData.length ? (
                <div className="empty-state">
                  <h3>No sales data yet</h3>
                  <p>Complete some orders to see the chart.</p>
                </div>
              ) : (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailySalesChartData}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="panel chart-panel">
              <div className="panel-head">
                <h3>Top Products</h3>
                <p>Best-selling items by quantity</p>
              </div>

              {!topProductsChartData.length ? (
                <div className="empty-state">
                  <h3>No top products yet</h3>
                  <p>Product sales will appear here.</p>
                </div>
              ) : (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProductsChartData}>
                      <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                      <XAxis dataKey="sku" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="quantity"
                        fill="#22c55e"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel">
              <div className="panel-head">
                <h3>Sales Summary</h3>
                <p>Aggregated report data</p>
              </div>

              <div className="summary-list">
                <div className="summary-row">
                  <span>Total Revenue</span>
                  <strong>₹ {salesReport?.summary?.totalRevenue || 0}</strong>
                </div>

                <div className="summary-row">
                  <span>Total Orders</span>
                  <strong>{salesReport?.summary?.totalOrders || 0}</strong>
                </div>

                <div className="summary-row">
                  <span>Total Items Sold</span>
                  <strong>{salesReport?.summary?.totalItemsSold || 0}</strong>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Top Products Table</h3>
                <p>Revenue and quantity overview</p>
              </div>

              <div className="simple-table">
                {(salesReport?.topProducts || []).map((item) => (
                  <div className="table-row products-table-row" key={item._id}>
                    <span>{item.sku}</span>
                    <span>{item.totalQuantity}</span>
                    <span>₹ {item.totalRevenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}