import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../lib/api';

const Profile = () => {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={user?.role === 'ROLE_ADMIN' ? '/admin/dashboard' : user?.role === 'ROLE_MANAGER' ? '/manager/dashboard' : '/dashboard'} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-secondary font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-secondary">AI-PPAP</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/logout" className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">Logout</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-secondary mb-6">Profile</h1>

          {!user ? (
            <div className="text-secondary/70">No user data found.</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-secondary/60 mb-1">Email</div>
                  <div className="text-secondary font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary/60 mb-1">Role</div>
                  <div className="text-secondary font-medium">{user.role?.replace('ROLE_', '')}</div>
                </div>
              </div>

              {/* Placeholder for future editable fields */}
              <div className="bg-background rounded-xl p-4 border border-secondary/10">
                <div className="text-secondary/80 mb-2 font-semibold">Account Settings</div>
                <p className="text-sm text-secondary/60">Profile editing coming soon.</p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-primary text-secondary text-sm font-semibold hover:bg-primary/90 transition">Go to Dashboard</Link>
                <Link to="/logout" className="px-4 py-2 rounded-xl border border-secondary/20 text-secondary text-sm hover:bg-background transition">Logout</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
