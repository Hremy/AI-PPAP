import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../lib/api';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear tokens and user data, then redirect to login
    try {
      logoutUser();
    } finally {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return null;
}
