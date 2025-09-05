import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { currentUser, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (hasRole('ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (hasRole('MANAGER')) {
    return <Navigate to="/manager/dashboard" replace />;
  } else if (hasRole('EMPLOYEE')) {
    // Employees access their dashboard at /dashboard (not /employee/dashboard)
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Default fallback
  return <Navigate to="/" replace />;
};

export default RoleBasedRedirect;
