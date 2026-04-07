import React, { createContext, useContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const value = useNotifications(60000);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
