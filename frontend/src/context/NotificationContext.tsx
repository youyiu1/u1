import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NotificationContextType {
  unreadCount: number;
  increaseUnread: (count?: number) => void;
  clearUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const increaseUnread = useCallback((count: number = 1) => {
    setUnreadCount(prev => prev + count);
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, increaseUnread, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};