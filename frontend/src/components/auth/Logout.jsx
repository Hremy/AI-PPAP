import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../lib/api';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear tokens and user data, then redirect to login
    const doLogout = async () => {
      try {
        await logoutUser();
      } finally {
        navigate('/login', { replace: true });
      }
    };
    doLogout();
  }, [navigate]);

  return null;
}
