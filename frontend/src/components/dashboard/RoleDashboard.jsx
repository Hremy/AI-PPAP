import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from '../../pages/dashboard/AdminDashboard';
import ManagerDashboard from '../../pages/dashboard/ManagerDashboard';
import EmployeeDashboard from '../../pages/dashboard/EmployeeDashboard';
import AdminLayout from '../../pages/admin/AdminLayout';

const RoleDashboard = () => {
  const { currentUser, hasRole } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard - wrapped in AdminLayout
  if (hasRole('ADMIN')) {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  }

  // Manager Dashboard
  if (hasRole('MANAGER')) {
    return <ManagerDashboard />;
  }

  // Employee Dashboard (default)
  return <EmployeeDashboard />;
};

export default RoleDashboard;
