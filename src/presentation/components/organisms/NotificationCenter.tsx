import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { NotificationContext, useNotification } from './NotificationContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  icon?: string;
  timestamp: number;
  read?: boolean;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-900';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    default:
      return 'bg-blue-50 border-blue-200 text-blue-900';
  }
};

const getIcon = (variant: string, customIcon?: string) => {
  if (customIcon) return customIcon;

  switch (variant) {
    case 'success': return 'bi-check-circle-fill';
    case 'error': return 'bi-exclamation-triangle-fill';
    case 'warning': return 'bi-exclamation-triangle';
    default: return 'bi-info-circle-fill';
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const removeNotificationRef = useRef<(id: string) => void>(() => {});

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  removeNotificationRef.current = removeNotification;

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      ...notificationData,
      id,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-remove after duration
    if (notificationData.duration !== 0) {
      setTimeout(() => {
        removeNotificationRef.current?.(id);
      }, notificationData.duration || 5000);
    }

    return id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification, markAsRead } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            className={cn(
              'relative p-4 rounded-lg border shadow-lg backdrop-blur-sm',
              getVariantStyles(notification.variant),
              !notification.read && 'ring-2 ring-offset-2 ring-current'
            )}
          >
            <div className="flex items-start gap-3">
              <i className={`bi ${getIcon(notification.variant, notification.icon)} text-lg flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                <div className="text-xs opacity-70 mt-2">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => {
                  markAsRead(notification.id);
                  removeNotification(notification.id);
                }}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Cerrar notificación"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};