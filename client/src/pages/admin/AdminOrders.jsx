import React, { useState, useEffect, useCallback } from 'react';
import { orderAPI } from '../../services/api';
import { Loader, Pagination } from '../../components/ui/UI';
import AdminNav from '../../components/admin/AdminNav';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_BADGE = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-gray',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.adminGetAll({ page, limit: 15, status: statusFilter || undefined, search: search || undefined });
      setOrders(data.orders);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await orderAPI.adminUpdateStatus(orderId, { status: newStatus });
      toast.success('Order status updated');
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchOrders(); };

  return (
    <div className="admin-page">
      <AdminNav />
      <div className="admin-page-header">
        <h1>Orders</h1>
        <p>Manage and update all customer orders</p>
      </div>

      {/* Filters */}
      <div className="admin-toolbar">
        <form className="admin-search-form" onSubmit={handleSearch}>
          <input
            className="form-input"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <select className="form-input admin-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
        </select>
        <span className="admin-count">{total} orders</span>
      </div>

      {loading ? <Loader /> : (
        <>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No orders found</td></tr>
                  ) : orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{order.order_number}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{order.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{order.user_email}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{order.item_count ?? '—'}</td>
                      <td style={{ fontWeight: 600 }}>₹{parseFloat(order.total).toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-gray" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{order.payment_method}</span></td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-input admin-status-select"
                          value={order.status}
                          disabled={updating === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminOrders;
