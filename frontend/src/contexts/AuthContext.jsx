import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utils/auth';
import { logoutUser } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userData = {
          id: decoded.sub,
          username: decoded.username,
          email: decoded.email,
          roles: decoded.roles || [],
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          department: decoded.department,
          position: decoded.position
        };
        setCurrentUser(userData);
        // Store user data for API interceptor
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Error decoding token:', error);
        removeAuthToken();
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);
    setAuthToken(token);
    const userData = {
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      roles: decoded.roles || [],
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      department: decoded.department,
      position: decoded.position
    };
    setCurrentUser(userData);
    // Store user data for API interceptor
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Try to call the server-side logout endpoint
      await logoutUser();
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with client-side cleanup even if server logout fails
    } finally {
      // Always perform client-side cleanup
      removeAuthToken();
      localStorage.removeItem('user');
      setCurrentUser(null);
      navigate('/login');
    }
  };

  const hasRole = (role) => {
    if (!currentUser) return false;
    // Handle both ROLE_ prefixed and non-prefixed roles
    const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    const normalizedUserRoles = currentUser.roles.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`);
    return normalizedUserRoles.includes(normalizedRole);
  };

  const updateUser = (updatedUserData) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    login,
    logout,
    hasRole,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
