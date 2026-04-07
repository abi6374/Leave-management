import { useCallback, useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';

export const useNotifications = (pollInterval = 60000) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      // Silent fetch to avoid noisy polling UX.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(timer);
  }, [fetchNotifications, pollInterval]);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    await fetchNotifications();
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    await fetchNotifications();
  };

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markRead,
    markAllRead,
  };
};
