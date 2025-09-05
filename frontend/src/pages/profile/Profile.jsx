import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  KeyIcon, 
  CheckIcon, 
  XMarkIcon,
  PencilIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { currentUser, hasRole, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  // State for editing modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // API calls for profile management
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await fetch('http://localhost:8084/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSuccessMessage('Profile updated successfully!');
      setIsEditingProfile(false);
      setErrors({});
      
      // Update auth context with new user data
      if (data.user) {
        updateUser({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email
        });
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors({ profile: error.message || 'Failed to update profile' });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      const response = await fetch('/api/v1/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ai_ppap_auth_token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSuccessMessage('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors({ password: error.message || 'Failed to change password' });
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    if (!profileForm.firstName.trim()) {
      setErrors({ firstName: 'First name is required' });
      return;
    }
    if (!profileForm.lastName.trim()) {
      setErrors({ lastName: 'Last name is required' });
      return;
    }
    if (!profileForm.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    if (!passwordForm.currentPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }
    if (!passwordForm.newPassword) {
      setErrors({ newPassword: 'New password is required' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    
    changePasswordMutation.mutate(passwordForm);
  };

  const getDashboardLink = () => {
    if (hasRole('ADMIN')) return '/admin/dashboard';
    if (hasRole('MANAGER')) return '/manager/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-secondary">AI-PPPA</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-secondary/70 hover:text-secondary transition-colors bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link 
                to={getDashboardLink()} 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/logout" 
                className="text-secondary/70 hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary mb-2">Profile Settings</h1>
          <p className="text-secondary/60">Manage your account information and security settings</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <CheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-secondary">Personal Information</h2>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Enter first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Enter last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {errors.profile && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{errors.profile}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center space-x-2 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" />
                      <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          firstName: currentUser?.firstName || '',
                          lastName: currentUser?.lastName || '',
                          email: currentUser?.email || ''
                        });
                        setErrors({});
                      }}
                      className="flex items-center space-x-2 px-6 py-3 border border-secondary/20 text-secondary rounded-lg hover:bg-background transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                      <div className="text-sm text-secondary/60 mb-1">First Name</div>
                      <div className="text-secondary font-medium">{currentUser?.firstName || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary/60 mb-1">Last Name</div>
                      <div className="text-secondary font-medium">{currentUser?.lastName || 'Not set'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary/60 mb-1">Email Address</div>
                    <div className="text-secondary font-medium">{currentUser?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary/60 mb-1">Role</div>
                    <div className="text-secondary font-medium">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                        {currentUser?.role?.replace('ROLE_', '') || 'User'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-secondary">Password & Security</h2>
                </div>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <KeyIcon className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary/50 hover:text-secondary"
                      >
                        {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary/50 hover:text-secondary"
                      >
                        {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary/50 hover:text-secondary"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {errors.password && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{errors.password}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="flex items-center space-x-2 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
                    >
                      <KeyIcon className="w-4 h-4" />
                      <span>{changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setErrors({});
                      }}
                      className="flex items-center space-x-2 px-6 py-3 border border-secondary/20 text-secondary rounded-lg hover:bg-background transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-secondary/60 mb-1">Password</div>
                    <div className="text-secondary">••••••••••••</div>
                  </div>
                  <div className="text-sm text-secondary/60">
                    Last changed: Never (or we don't track this yet)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-secondary mb-4">Account Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {(currentUser?.firstName || currentUser?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-secondary">
                      {currentUser?.firstName && currentUser?.lastName 
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser?.email
                      }
                    </div>
                    <div className="text-sm text-secondary/60">
                      {currentUser?.role?.replace('ROLE_', '') || 'User'}
                    </div>
                  </div>
                </div>

                <div className="border-t border-primary/10 pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary/60">Account Status</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary/60">Member Since</span>
                      <span className="text-secondary">2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary/60">Last Login</span>
                      <span className="text-secondary">Today</span>
                    </div>
                  </div>
              </div>

                <div className="border-t border-primary/10 pt-4">
                  <Link 
                    to={getDashboardLink()}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <span>Go to Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;