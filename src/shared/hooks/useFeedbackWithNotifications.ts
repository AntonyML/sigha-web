import { useContext, useCallback, useMemo } from 'react';
import { FeedbackContext } from '@/app/providers/FeedbackContext';
import { NotificationContext } from '@/shared/ui/notifications/NotificationContext';

export const useFeedbackWithNotifications = () => {
  const feedback = useContext(FeedbackContext);
  const notifications = useContext(NotificationContext);

  if (!feedback) {
    throw new Error('useFeedbackWithNotifications must be used within FeedbackProvider');
  }

  const addNotification = notifications?.addNotification;
  const feedbackShowNotification = feedback.showNotification;

  const showNotification = useCallback(
    (options: {
      title: string;
      message: string;
      variant: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
      icon?: string;
    }) => {
      // Use notifications if available, otherwise fall back to toast
      if (addNotification) {
        addNotification(options);
      } else {
        feedbackShowNotification(options);
      }
    },
    [addNotification, feedbackShowNotification]
  );

  return useMemo(
    () => ({
      ...feedback,
      showNotification,
    }),
    [feedback, showNotification]
  );
};