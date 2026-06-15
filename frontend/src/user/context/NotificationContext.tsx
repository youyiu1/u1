import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const NOTIFICATION_CREATED_EVENT = 'notification-created';

interface NotificationContextType {
  unreadCount: number;
  increaseUnread: (count?: number) => void;
  clearUnread: () => void;
  setUnreadCount: (count: number) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  receiveNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const increaseUnread = useCallback((count: number = 1) => {
    setUnreadCount((prev) => prev + count);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const assignUnreadCount = useCallback((count: number) => {
    setUnreadCount(Math.max(0, count));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const receiveNotification = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handleNotificationCreated = () => {
      triggerRefresh();
    };
    window.addEventListener(NOTIFICATION_CREATED_EVENT, handleNotificationCreated);
    return () => window.removeEventListener(NOTIFICATION_CREATED_EVENT, handleNotificationCreated);
  }, [triggerRefresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, increaseUnread, clearUnread, setUnreadCount: assignUnreadCount, refreshTrigger, triggerRefresh, receiveNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
