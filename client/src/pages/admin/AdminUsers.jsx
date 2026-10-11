import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { Loader, Pagination } from '../../components/ui/UI';
import { FiTrash2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ page, limit: 15, search: search || undefined });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally { setDeleting(null); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>View and manage all registered users</p>
      </div>

      <div className="admin-toolbar">
        <form className="admin-search-form" onSubmit={handleSearch}>
          <input
            className="form-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <span className="admin-count">{total} users</span>
      </div>

      {loading ? <Loader /> : (
        <>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No users found</td></tr>
                  ) : users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">{user.name[0].toUpperCase()}</div>
                          <span style={{ fontWeight: 500 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{user.email}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{user.phone || '—'}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        {user.role !== 'admin' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(user.id, user.name)}
                            disabled={deleting === user.id}
                          >
                            <FiTrash2 size={13} /> {deleting === user.id ? '...' : 'Delete'}
                          </button>
                        )}
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

export default AdminUsers;
