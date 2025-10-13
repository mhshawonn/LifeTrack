import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient, { handleApiError } from '../api/apiClient.js';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  updateUserLocally: () => {},
});

const getStoredValue = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredValue('lifetrack_user'));
  const [token, setToken] = useState(() => localStorage.getItem('lifetrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('lifetrack_user', JSON.stringify(data.user));
      } catch (error) {
        console.warn('Session expired:', handleApiError(error));
        localStorage.removeItem('lifetrack_token');
        localStorage.removeItem('lifetrack_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const setUserWithStorage = (nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem('lifetrack_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('lifetrack_user');
    }
  };

  const authenticate = (payload) => {
    setUserWithStorage(payload.user);
    setToken(payload.token);
    localStorage.setItem('lifetrack_token', payload.token);
  };

  const login = async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    authenticate(data);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    authenticate(data);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout warning:', handleApiError(error));
    }
    setUserWithStorage(null);
    setToken(null);
    localStorage.removeItem('lifetrack_token');
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const { data } = await apiClient.get('/auth/me');
      setUserWithStorage(data.user);
      return data.user;
    } catch (error) {
      console.warn('Refresh user failed:', handleApiError(error));
      return null;
    }
  };

  const updateUserLocally = (updater) => {
    setUser((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next) {
        localStorage.setItem('lifetrack_user', JSON.stringify(next));
      } else {
        localStorage.removeItem('lifetrack_user');
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      register,
      logout,
      refreshUser,
      updateUserLocally,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
