import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeDashboard from '../../pages/dashboard/EmployeeDashboard';

const DashboardRouter = () => {
  const { currentUser, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Only employees can access /dashboard - others get redirected to their specific dashboards
  if (hasRole('ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (hasRole('MANAGER')) {
    return <Navigate to="/manager/dashboard" replace />;
  } else if (hasRole('EMPLOYEE')) {
    // Show the dynamic employee dashboard
    return <EmployeeDashboard />;
  }

  // Default fallback
  return <Navigate to="/" replace />;
};

export default DashboardRouter;

