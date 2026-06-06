import React, { useContext, useEffect, useRef, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { notificationApi } from '../../services/api';
import { Notification } from '../../types';
import { AuthContext } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { getErrorMessage } from '../../utils/error';

const BOOKING_REQUEST_TITLE = '新的预约请求';
const MARKET_REQUEST_TITLE = '新的购买请求';

const formatTime = (time: string) => {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) {
    return time;
  }
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
};

function isBookingNotification(notification: Notification) {
  return notification.title === BOOKING_REQUEST_TITLE;
}

function isMarketNotification(notification: Notification) {
  return notification.title === MARKET_REQUEST_TITLE;
}

function isActionableNotification(notification: Notification) {
  return isBookingNotification(notification) || isMarketNotification(notification);
}

function getProcessErrorMessage(notification: Notification, accept: boolean) {
  if (isMarketNotification(notification)) {
    return accept ? '同意购买失败' : '拒绝购买失败';
  }
  return accept ? '同意预约失败' : '拒绝预约失败';
}

export const HeaderNotifications: React.FC = () => {
  const { user, isAuthenticated, authReady } = useContext(AuthContext);
  const { clearUnread, refreshTrigger } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const refreshNotifications = async (userId: string, withLoading = false) => {
    if (withLoading) {
      setLoading(true);
    }
    try {
      const data = await notificationApi.list(userId);
      setNotifications(data);
    } catch (error) {
      console.error(getErrorMessage(error, '通知加载失败'));
    } finally {
      if (withLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!authReady) {
      return;
    }
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      return;
    }
    void refreshNotifications(user.id, true);
  }, [authReady, isAuthenticated, refreshTrigger, user?.id]);

  useEffect(() => {
    if (!authReady || !showNotifications || !isAuthenticated || !user?.id) {
      return;
    }
    const timer = window.setTimeout(() => {
      void refreshNotifications(user.id);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [authReady, isAuthenticated, showNotifications, user?.id]);

  const handleMarkAllRead = () => {
    setShowConfirm(true);
  };

  const confirmMarkAllRead = async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }
    setShowConfirm(false);
    try {
      await notificationApi.markAllRead(user.id);
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      clearUnread();
    } catch (error) {
      console.error(getErrorMessage(error, '全部已读操作失败'));
    }
  };

  const handleProcessNotification = async (notification: Notification, accept: boolean) => {
    if (!isAuthenticated || !user?.id) {
      return;
    }
    setProcessingId(notification.id);
    try {
      await notificationApi.process({
        notificationId: notification.id,
        accept,
        sellerId: user.id,
      });
      await refreshNotifications(user.id);
    } catch (error) {
      console.error(getErrorMessage(error, getProcessErrorMessage(notification, accept)));
    } finally {
      setProcessingId(null);
    }
  };

  const markNotificationRead = async (notification: Notification) => {
    if (!isAuthenticated || !user?.id || notification.isRead || (isActionableNotification(notification) && !notification.isProcessed)) {
      return;
    }
    try {
      await notificationApi.markRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
      );
    } catch (error) {
      console.error(getErrorMessage(error, '通知已读更新失败'));
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setShowNotifications((current) => !current)}
        className={`relative rounded-2xl p-2.5 transition-all ${
          showNotifications ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-soft'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {showNotifications ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 z-10 bg-black/20"
              style={{ pointerEvents: 'auto' }}
            />
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-full z-20 mt-3 w-80 overflow-hidden rounded-[32px] border border-hairline bg-white shadow-premium"
              style={{ pointerEvents: 'auto' }}
            >
              <div className="flex items-center justify-between border-b border-hairline p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-ink">通知中心</h3>
                {unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black uppercase tracking-widest text-primary transition-opacity hover:opacity-70"
                  >
                    全部已读
                  </button>
                ) : null}
              </div>
              <div className="max-h-[400px] overflow-y-auto pb-4 pt-2">
                {loading ? (
                  <div className="py-8 text-center text-xs text-muted">加载中...</div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => void markNotificationRead(notification)}
                      className={`relative cursor-pointer px-6 py-4 transition-colors hover:bg-surface-soft ${
                        !notification.isRead ? 'bg-primary/[0.03]' : ''
                      }`}
                    >
                      {!notification.isRead ? (
                        <div className="absolute left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,56,92,0.5)]" />
                      ) : null}
                      <div className="mb-1 flex items-start justify-between">
                        <h4 className={`text-sm tracking-tight ${notification.isRead ? 'font-bold text-secondary' : 'font-black text-ink'}`}>
                          {notification.title}
                          {notification.serviceName ? (
                            <span className="ml-2 rounded-full bg-primary/5 px-2 py-0.5 text-[10px] text-primary">
                              {notification.serviceName}
                            </span>
                          ) : null}
                        </h4>
                        <span className="text-[10px] font-bold text-muted">{formatTime(notification.time)}</span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-secondary">{notification.content}</p>
                      {isActionableNotification(notification) && !notification.isProcessed ? (
                        <div className="mt-3 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                          <button
                            onClick={() => void handleProcessNotification(notification, true)}
                            disabled={processingId === notification.id}
                            className="flex items-center gap-1 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                          >
                            <Check className="h-3 w-3" />
                            同意
                          </button>
                          <button
                            onClick={() => void handleProcessNotification(notification, false)}
                            disabled={processingId === notification.id}
                            className="flex items-center gap-1 rounded-xl bg-stone-200 px-3 py-1.5 text-xs font-bold text-stone-600 transition-colors hover:bg-stone-300 disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                            拒绝
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <Bell className="mx-auto mb-3 h-8 w-8 text-muted/30" />
                    <p className="text-xs font-bold text-muted">暂时没有通知</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirm}
        title="全部已读"
        message="确认将所有通知标记为已读吗？"
        confirmText="确认"
        cancelText="取消"
        onConfirm={confirmMarkAllRead}
        onCancel={() => setShowConfirm(false)}
        position="button"
      />
    </div>
  );
};
