import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ ShopEase</Link>
          <h2>Reset Password</h2>
          <p>Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">New Password <span>*</span></label>
            <div className="input-icon-wrap">
              <FiLock size={16} className="input-icon" />
              <input type="password" className="form-input with-icon" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password <span>*</span></label>
            <div className="input-icon-wrap">
              <FiLock size={16} className="input-icon" />
              <input type="password" className="form-input with-icon" placeholder="Repeat password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ResetPassword;
