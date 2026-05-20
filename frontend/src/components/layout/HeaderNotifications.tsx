import React, { useState, useEffect, useContext } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationApi } from '../../services/api';
import { Notification } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

const formatTime = (time: string) => {
  const d = new Date(time);
  if (isNaN(d.getTime())) return time;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

export const HeaderNotifications: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { clearUnread } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 计算未读数
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 页面加载时获取通知
  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      try {
        const data = await notificationApi.list(user.id);
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();
  }, [user?.id]);

  // 每次打开通知面板时刷新
  useEffect(() => {
    if (!showNotifications || !user?.id) return;
    const fetchNotifications = async () => {
      try {
        const data = await notificationApi.list(user.id);
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();
  }, [showNotifications, user?.id]);

  const handleMarkAllRead = () => {
    setShowConfirm(true);
  };

  const confirmMarkAllRead = async () => {
    if (!user?.id) return;
    setShowConfirm(false);
    try {
      await notificationApi.markAllRead(user.id);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    clearUnread();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`p-2.5 rounded-2xl transition-all relative ${showNotifications ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-soft'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-white border border-hairline rounded-[32px] shadow-premium z-20 overflow-hidden"
            >
              <div className="p-6 border-b border-hairline flex items-center justify-between">
                <h3 className="font-black text-ink uppercase tracking-widest text-[10px]">通知中心</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto pt-2 pb-4">
                {loading ? (
                  <div className="py-8 text-center text-muted text-xs">加载中...</div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={async () => {
                        if (!notification.isRead && user?.id) {
                          try {
                            await notificationApi.markRead(notification.id);
                            setNotifications(prev => prev.map(n =>
                              n.id === notification.id ? { ...n, isRead: true } : n
                            ));
                          } catch (err) {
                            console.error('Failed to mark read:', err);
                          }
                        }
                      }}
                      className={`px-6 py-4 hover:bg-surface-soft transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-primary/[0.03]' : ''}`}
                    >
                      {!notification.isRead && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,56,92,0.5)]" />
                      )}
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm tracking-tight ${notification.isRead ? 'font-bold text-secondary' : 'font-black text-ink'}`}>
                          {notification.title}
                          {notification.serviceName && (
                            <span className="ml-2 text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                              {notification.serviceName}
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-muted font-bold">{formatTime(notification.time)}</span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                        {notification.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <Bell className="w-8 h-8 text-muted/30 mx-auto mb-3" />
                    <p className="text-xs text-muted font-bold">暂无通知</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirm}
        title="全部已读"
        message="确定将所有通知标记为已读？"
        confirmText="确定"
        cancelText="取消"
        onConfirm={confirmMarkAllRead}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};