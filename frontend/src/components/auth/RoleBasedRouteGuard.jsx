import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleBasedRouteGuard({ children }) {
  const { currentUser, isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

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

  const currentPath = location.pathname;

  // Allow public routes for unauthenticated users
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/admin/login', '/pricing'];
  if (!isAuthenticated && publicRoutes.includes(currentPath)) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin role restrictions - can only access /admin routes
  if (hasRole('ADMIN')) {
    // Allow admin login page
    if (currentPath === '/admin/login') {
      return children;
    }
    
    // Redirect admins away from non-admin routes
    if (!currentPath.startsWith('/admin') && !currentPath.startsWith('/logout')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Manager role restrictions - can only access /manager routes
  if (hasRole('MANAGER')) {
    // Redirect managers away from non-manager routes (except logout)
    if (!currentPath.startsWith('/manager') && !currentPath.startsWith('/logout')) {
      return <Navigate to="/manager/dashboard" replace />;
    }
  }

  // Employee role - can access most routes except /admin and /manager
  if (hasRole('EMPLOYEE')) {
    // Block employees from admin and manager routes
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/manager')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
