import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle, FiGrid } from 'react-icons/fi';
import { adminAPI, orderAPI } from '../../services/api';
import { Loader } from '../../components/ui/UI';
import AdminNav from '../../components/admin/AdminNav';
import './Admin.css';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color }}>{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, repRes] = await Promise.all([adminAPI.getDashboard(), orderAPI.getSalesReport({ days: 30 })]);
        setData(dashRes.data);
        setReport(repRes.data.report);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  const STATUS_BADGE = { pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={<FiUsers size={22} />} label="Total Users" value={data?.stats?.totalUsers?.toLocaleString()} color="#4299e1" />
        <StatCard icon={<FiPackage size={22} />} label="Products" value={data?.stats?.totalProducts?.toLocaleString()} color="#48bb78" />
        <StatCard icon={<FiShoppingCart size={22} />} label="Total Orders" value={data?.stats?.totalOrders?.toLocaleString()} sub={`${data?.stats?.pendingOrders} pending`} color="#ed8936" />
        <StatCard icon={<FiDollarSign size={22} />} label="Revenue (30d)" value={`₹${parseFloat(report?.summary?.total_revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#e53e3e" />
      </div>

      <div className="dashboard-grid">
        {/* Chart */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">Revenue & Orders (Last 30 Days)</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={report?.daily || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e53e3e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e53e3e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${parseFloat(v).toLocaleString('en-IN')}` : v, n]} labelFormatter={(l) => new Date(l).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} />
                <Area type="monotone" dataKey="revenue" stroke="#e53e3e" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">Recent Orders <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All</Link></div>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {(data?.recentOrders || []).map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/admin/orders`} style={{ color: 'var(--primary)', fontWeight: 600 }}>#{o.order_number}</Link></td>
                    <td>{o.user_name}</td>
                    <td>₹{parseFloat(o.total).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="card-header"><FiAlertTriangle size={15} style={{ color: 'var(--warning)' }} /> Low Stock Alert</div>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Product</th><th>SKU</th><th>Stock</th></tr></thead>
              <tbody>
                {(data?.lowStock || []).map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}>{p.sku}</td>
                    <td><span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>{p.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
