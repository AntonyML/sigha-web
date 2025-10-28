import { useContext } from 'react';
import { FeedbackContext } from '../context/FeedbackContext';
import { NotificationContext } from '../components/organisms/NotificationContext';

export const useFeedbackWithNotifications = () => {
  const feedback = useContext(FeedbackContext);
  const notifications = useContext(NotificationContext);

  if (!feedback) {
    throw new Error('useFeedbackWithNotifications must be used within FeedbackProvider');
  }

  const showNotification = (options: {
    title: string;
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    icon?: string;
  }) => {
    // Use notifications if available, otherwise fall back to toast
    if (notifications) {
      notifications.addNotification(options);
    } else {
      feedback.showNotification(options);
    }
  };

  return {
    ...feedback,
    showNotification,
  };
};