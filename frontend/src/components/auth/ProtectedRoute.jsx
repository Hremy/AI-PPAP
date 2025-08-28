import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { currentUser, isAuthenticated, loading, hasRole } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole || requiredRoles) {
    let hasAccess = false;

    // Check single required role
    if (requiredRole) {
      hasAccess = hasRole(requiredRole);
    }

    // Check multiple required roles (user needs at least one)
    if (requiredRoles && Array.isArray(requiredRoles)) {
      hasAccess = requiredRoles.some(role => hasRole(role));
    }

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user's actual role
      if (hasRole('ADMIN')) {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (hasRole('MANAGER')) {
        return <Navigate to="/manager/dashboard" replace />;
      } else {
        // Employee or no role - redirect to home
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
}
