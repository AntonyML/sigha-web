import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '../components/molecules/Modal/Modal';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ModalVariant = 'confirm' | 'alert' | 'custom';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ModalOptions {
  title: string;
  description?: string;
  variant?: ModalVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  content?: React.ReactNode;
}

interface NotificationOptions {
  title: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  icon?: string;
}

interface FeedbackContextType {
  showToast: (variant: ToastVariant, options: ToastOptions) => void;
  showModal: (options: ModalOptions) => Promise<boolean>;
  showNotification: (options: NotificationOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  confirm: (title: string, description?: string) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export { FeedbackContext };

// eslint-disable-next-line react-refresh/only-export-components
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    options: ModalOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: null,
    resolve: null,
  });

  const showToast = useCallback((variant: ToastVariant, options: ToastOptions) => {
    const { title, description, duration = 4000, action } = options;
    
    const message = title || description || '';
    const toastOptions: {
      description?: string;
      duration: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    } = {
      description: title && description ? description : undefined,
      duration,
    };

    if (action) {
      toastOptions.action = {
        label: action.label,
        onClick: action.onClick,
      };
    }

    switch (variant) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
    }
  }, []);

  const showModal = useCallback((options: ModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        open: true,
        options,
        resolve,
      });
    });
  }, []);

  const showNotification = useCallback((options: NotificationOptions) => {
    showToast(options.variant, {
      title: options.title,
      description: options.message,
      duration: options.duration,
    });
  }, [showToast]);

  const success = useCallback((message: string, title?: string) => {
    showToast('success', { title: title || 'Éxito', description: message });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast('error', { title: title || 'Error', description: message });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast('warning', { title: title || 'Advertencia', description: message });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast('info', { title: title || 'Información', description: message });
  }, [showToast]);

  const confirm = useCallback((title: string, description?: string): Promise<boolean> => {
    return showModal({
      title,
      description,
      variant: 'confirm',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
    });
  }, [showModal]);

  const handleModalClose = useCallback((confirmed: boolean) => {
    if (modalState.resolve) {
      modalState.resolve(confirmed);
    }
    setModalState({ open: false, options: null, resolve: null });
  }, [modalState]);

  const handleConfirm = useCallback(async () => {
    if (modalState.options?.onConfirm) {
      await modalState.options.onConfirm();
    }
    handleModalClose(true);
  }, [modalState.options, handleModalClose]);

  const handleCancel = useCallback(() => {
    if (modalState.options?.onCancel) {
      modalState.options.onCancel();
    }
    handleModalClose(false);
  }, [modalState.options, handleModalClose]);

  return (
    <FeedbackContext.Provider
      value={{
        showToast,
        showModal,
        showNotification,
        success,
        error,
        warning,
        info,
        confirm,
      }}
    >
      {children}

      <Modal open={modalState.open} onOpenChange={(open) => !open && handleCancel()}>
        <ModalContent>
          {modalState.options && (
            <>
              <ModalHeader>
                <ModalTitle>{modalState.options.title}</ModalTitle>
                {modalState.options.description && (
                  <ModalDescription>{modalState.options.description}</ModalDescription>
                )}
              </ModalHeader>

              {modalState.options.content && (
                <div className="py-4">{modalState.options.content}</div>
              )}

              <ModalFooter>
                {modalState.options.variant !== 'alert' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    {modalState.options.cancelText || 'Cancelar'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {modalState.options.confirmText || 'Aceptar'}
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </FeedbackContext.Provider>
  );
};
