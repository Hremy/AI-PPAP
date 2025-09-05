import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      // The logout function from AuthContext should handle the navigation
      // But we'll add a fallback in case it doesn't
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return null;
}
