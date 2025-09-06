import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ManagerSetPassword() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    let shouldForce = false;
    try {
      if (location.state?.forcePasswordChange) shouldForce = true;
      if (sessionStorage.getItem('force_password_change') === '1') shouldForce = true;
    } catch (_) {}
    if (shouldForce) {
      setBanner('For security, please set a new password before continuing.');
    }
  }, [location.state]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const forced = !!banner;
    if ((!forced && !form.currentPassword) || !form.newPassword || !form.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8084/api/v1/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          'X-User': currentUser?.username || currentUser?.email || ''
        },
        body: JSON.stringify(forced ? { newPassword: form.newPassword } : { currentPassword: form.currentPassword, newPassword: form.newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to change password');
      }
      toast.success(data.message || 'Password changed successfully');
      try { sessionStorage.removeItem('force_password_change'); } catch (_) {}
      setTimeout(() => navigate('/manager/dashboard'), 600);
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white/90 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <h1 className="text-lg font-semibold text-secondary">Set New Password</h1>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {banner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">{banner}</p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-primary/10 p-6">
          <form onSubmit={onSubmit} className="space-y-4 max-w-md">
            {!banner ? (
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Current Password</label>
                <input type="password" value={form.currentPassword} onChange={(e)=>setForm(f=>({...f,currentPassword:e.target.value}))}
                       className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary" required />
              </div>
            ) : null}
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">New Password</label>
              <input type="password" value={form.newPassword} onChange={(e)=>setForm(f=>({...f,newPassword:e.target.value}))}
                     className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Confirm New Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e)=>setForm(f=>({...f,confirmPassword:e.target.value}))}
                     className="w-full px-3 py-2 border rounded-lg border-secondary/30 focus:ring-2 focus:ring-primary focus:border-primary" required />
            </div>
            <div>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50">
                {submitting ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
