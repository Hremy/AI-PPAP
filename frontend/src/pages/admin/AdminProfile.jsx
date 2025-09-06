import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import { 
  UserIcon, 
  EnvelopeIcon, 
  KeyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const { currentUser, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('profile');

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8084/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          'X-User': currentUser?.username || currentUser?.email || '',
          'X-Roles': (currentUser?.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',')
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const normalized = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || ''
      };
      setProfileData(normalized);
      // Keep the sidebar (AuthContext) in sync with the latest profile values
      updateUser(normalized);
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('http://localhost:8084/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          'X-User': currentUser?.username || currentUser?.email || '',
          'X-Roles': (currentUser?.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',')
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['adminProfile']);
      // Update AuthContext so sidebar reflects latest name immediately
      const updated = {
        firstName: res?.firstName ?? profileData.firstName,
        lastName: res?.lastName ?? profileData.lastName,
        email: res?.email ?? profileData.email,
        phone: res?.phone ?? profileData.phone,
        department: res?.department ?? profileData.department,
        position: res?.position ?? profileData.position,
      };
      updateUser(updated);
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('http://localhost:8084/api/v1/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`,
          'X-User': currentUser?.username || currentUser?.email || '',
          'X-Roles': (currentUser?.roles || []).map(r => r.startsWith('ROLE_') ? r.slice(5) : r).join(',')
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password');
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  if (profileLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrator Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your administrator account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon className="w-5 h-5 inline mr-2" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <KeyIcon className="w-5 h-5 inline mr-2" />
              Change Password
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{profileData.position || 'Administrator'}</p>
                  <p className="text-sm text-gray-500">{profileData.department || 'Administration'}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                    <ShieldCheckIcon className="w-3 h-3 mr-1" />
                    Administrator
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {updateProfileMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500">Update your administrator password to keep your account secure</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    minLength="6"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isLoading}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {changePasswordMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <KeyIcon className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;

