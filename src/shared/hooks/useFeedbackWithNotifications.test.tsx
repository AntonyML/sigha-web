import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useFeedbackWithNotifications } from './useFeedbackWithNotifications';
import { FeedbackContext } from '@/app/providers/FeedbackContext';
import { NotificationContext } from '@/shared/ui/notifications/NotificationContext';

describe('useFeedbackWithNotifications', () => {
  const mockFeedbackContext = {
    showToast: vi.fn(),
    showModal: vi.fn(),
    showNotification: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    confirm: vi.fn(),
  };

  const mockNotificationContext = {
    notifications: [],
    addNotification: vi.fn(),
    removeNotification: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    clearAll: vi.fn(),
    unreadCount: 0,
  };

  it('lanza error si se usa fuera de FeedbackProvider', () => {
    expect(() => {
      renderHook(() => useFeedbackWithNotifications());
    }).toThrow('useFeedbackWithNotifications must be used within FeedbackProvider');
  });

  it('mantiene la misma referencia de objeto a través de re-renders cuando las dependencias no cambian', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeedbackContext.Provider value={mockFeedbackContext}>
        <NotificationContext.Provider value={mockNotificationContext}>
          {children}
        </NotificationContext.Provider>
      </FeedbackContext.Provider>
    );

    const { result, rerender } = renderHook(() => useFeedbackWithNotifications(), { wrapper });

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    // Must preserve reference equality to avoid triggering useEffect/useCallback loops
    expect(firstResult).toBe(secondResult);
    expect(firstResult.showNotification).toBe(secondResult.showNotification);
  });

  it('delega showNotification a NotificationContext cuando está disponible', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FeedbackContext.Provider value={mockFeedbackContext}>
        <NotificationContext.Provider value={mockNotificationContext}>
          {children}
        </NotificationContext.Provider>
      </FeedbackContext.Provider>
    );

    const { result } = renderHook(() => useFeedbackWithNotifications(), { wrapper });

    result.current.showNotification({
      title: 'Aviso',
      message: 'Mensaje de prueba',
      variant: 'info',
    });

    expect(mockNotificationContext.addNotification).toHaveBeenCalledWith({
      title: 'Aviso',
      message: 'Mensaje de prueba',
      variant: 'info',
    });
    expect(mockFeedbackContext.showNotification).not.toHaveBeenCalled();
  });
});
