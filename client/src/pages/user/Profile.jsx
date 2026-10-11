import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('phone', form.phone);
    if (avatarFile) fd.append('avatar', avatarFile);
    await updateProfile(fd);
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmNew) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-section">
              {user?.avatar
                ? <img src={`${UPLOADS}/avatars/${user.avatar}`} alt={user.name} className="profile-avatar" />
                : <div className="profile-avatar-placeholder">{user?.name[0].toUpperCase()}</div>
              }
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>{user?.role}</span>
            </div>
            <nav className="profile-nav">
              <button className={`profile-nav-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>👤 Edit Profile</button>
              <button className={`profile-nav-btn ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>🔒 Change Password</button>
            </nav>
          </aside>

          {/* Main */}
          <div className="profile-main">
            {tab === 'profile' && (
              <div className="card">
                <div className="card-header">Edit Profile</div>
                <div className="card-body">
                  <form onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                      <label className="form-label">Profile Photo</label>
                      <div className="avatar-upload">
                        {avatarFile
                          ? <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="avatar-preview" />
                          : user?.avatar
                            ? <img src={`${UPLOADS}/avatars/${user.avatar}`} alt={user.name} className="avatar-preview" />
                            : <div className="avatar-placeholder-sm">{user?.name[0].toUpperCase()}</div>
                        }
                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                          Upload Photo
                          <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                  </form>
                </div>
              </div>
            )}

            {tab === 'password' && (
              <div className="card">
                <div className="card-header">Change Password</div>
                <div className="card-body">
                  <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
                    {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmNew', 'Confirm New Password']].map(([field, label]) => (
                      <div className="form-group" key={field}>
                        <label className="form-label">{label} <span>*</span></label>
                        <input type="password" className="form-input" value={pwdForm[field]} onChange={(e) => setPwdForm((f) => ({ ...f, [field]: e.target.value }))} required />
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
