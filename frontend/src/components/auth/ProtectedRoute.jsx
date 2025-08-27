import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../lib/api';

export default function ProtectedRoute({ children, requiredRole }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      
      if (authenticated) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = user.role;
        setUserRole(role);
        
        // Check role-based access
        if (requiredRole) {
          // Admin can access everything
          if (role === 'ROLE_ADMIN') {
            setHasAccess(true);
          }
          // Manager can access manager and employee routes
          else if (role === 'ROLE_MANAGER' && (requiredRole === 'ROLE_MANAGER' || requiredRole === 'ROLE_EMPLOYEE')) {
            setHasAccess(true);
          }
          // Employee can only access employee routes
          else if (role === 'ROLE_EMPLOYEE' && requiredRole === 'ROLE_EMPLOYEE') {
            setHasAccess(true);
          }
          // Exact role match
          else if (role === requiredRole) {
            setHasAccess(true);
          }
          else {
            setHasAccess(false);
          }
        } else {
          // No specific role required, just need to be authenticated
          setHasAccess(true);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasAccess) {
    // Redirect to appropriate dashboard based on user's actual role
    switch (userRole) {
      case 'ROLE_ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'ROLE_MANAGER':
        return <Navigate to="/manager/dashboard" replace />;
      case 'ROLE_EMPLOYEE':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
