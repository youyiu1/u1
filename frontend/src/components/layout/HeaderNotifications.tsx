import React, { useState, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NOTIFICATIONS } from '../../constants';

export const HeaderNotifications: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

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
                    onClick={() => {
                      setNotifications(notifications.map(n => ({ ...n, read: true })));
                    }}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto pt-2 pb-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`px-6 py-4 hover:bg-surface-soft transition-colors cursor-pointer relative ${!notification.read ? 'bg-primary/[0.03]' : ''}`}
                    >
                      {!notification.read && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,56,92,0.5)]" />
                      )}
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm tracking-tight ${notification.read ? 'font-bold text-secondary' : 'font-black text-ink'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-muted font-bold">{notification.time}</span>
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
    </div>
  );
};
