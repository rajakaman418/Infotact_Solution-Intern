import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStats(res.data);

      const months = ["Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"];

      let formatted = res.data.monthlyData.map((item) => ({
        month: months[item._id - 1],
        sales: item.totalSales,
      }));

      // fallback
      if (!formatted.length) {
        formatted = [
          { month: "Jan", sales: 0 },
          { month: "Feb", sales: 0 },
        ];
      }

      setChartData(formatted);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        <Card title="Products" value={stats.totalProducts || 0} />
        <Card title="Orders" value={stats.totalOrders || 0} />
        <Card title="Revenue" value={`₹ ${stats.totalRevenue || 0}`} />

      </div>

      {/* CHART */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="mb-2 font-semibold">Sales Chart</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-blue-500 text-white p-4 rounded">
      <h3>{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}