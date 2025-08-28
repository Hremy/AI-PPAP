import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getAuthToken, setAuthToken, removeAuthToken } from '../utils/auth';

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
        setCurrentUser({
          id: decoded.sub,
          username: decoded.username,
          email: decoded.email,
          roles: decoded.roles || [],
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          department: decoded.department,
          position: decoded.position
        });
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
    setCurrentUser({
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      roles: decoded.roles || [],
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      department: decoded.department,
      position: decoded.position
    });
  };

  const logout = () => {
    removeAuthToken();
    setCurrentUser(null);
    navigate('/login');
  };

  const hasRole = (role) => {
    if (!currentUser) return false;
    // Handle both ROLE_ prefixed and non-prefixed roles
    const normalizedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    const normalizedUserRoles = currentUser.roles.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`);
    return normalizedUserRoles.includes(normalizedRole);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    login,
    logout,
    hasRole
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
