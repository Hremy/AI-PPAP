const TOKEN_KEY = 'ai_ppap_auth_token';

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};
