import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient, { handleApiError } from '../api/apiClient.js';
import { useAuthContext } from './AuthContext.jsx';

const DashboardContext = createContext({
  metrics: null,
  loading: true,
  notifications: [],
  error: null,
  refreshDashboard: async () => {},
  refreshNotifications: async () => {},
});

export const DashboardProvider = ({ children }) => {
  const [metrics, setMetrics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuthContext();

  const fetchDashboard = async () => {
    if (!isAuthenticated || !token) {
      setMetrics(null);
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [{ data: dashboardData }, { data: notificationData }] = await Promise.all([
        apiClient.get('/dashboard'),
        apiClient.get('/notifications'),
      ]);
      setMetrics(dashboardData);
      setNotifications(notificationData.notifications);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    if (!isAuthenticated || !token) return;
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      console.warn('Failed to refresh notifications:', handleApiError(err));
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token, isAuthenticated]);

  const value = useMemo(
    () => ({
      metrics,
      notifications,
      loading,
      error,
      refreshDashboard: fetchDashboard,
      refreshNotifications,
    }),
    [metrics, notifications, loading, error]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => useContext(DashboardContext);
