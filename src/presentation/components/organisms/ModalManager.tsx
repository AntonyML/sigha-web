import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '../molecules/Modal/Modal';

interface ModalInstance {
  id: string;
  title: string;
  description?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'confirm' | 'alert' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface ModalManagerContextType {
  openModal: (modal: Omit<ModalInstance, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  modals: ModalInstance[];
}

const ModalManagerContext = createContext<ModalManagerContextType | undefined>(undefined);

export const useModalManager = () => {
  const context = useContext(ModalManagerContext);
  if (!context) {
    throw new Error('useModalManager must be used within ModalManagerProvider');
  }
  return context;
};

export const ModalManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalInstance[]>([]);

  const openModal = useCallback((modalData: Omit<ModalInstance, 'id'>): string => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const modal: ModalInstance = { id, ...modalData };
    setModals(prev => [...prev, modal]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const handleConfirm = useCallback(async (modal: ModalInstance) => {
    if (modal.onConfirm) {
      await modal.onConfirm();
    }
    closeModal(modal.id);
  }, [closeModal]);

  const handleCancel = useCallback((modal: ModalInstance) => {
    if (modal.onCancel) {
      modal.onCancel();
    }
    closeModal(modal.id);
  }, [closeModal]);

  const getSizeClasses = (size?: string) => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      default: return 'max-w-lg';
    }
  };

  return (
    <ModalManagerContext.Provider value={{ openModal, closeModal, closeAllModals, modals }}>
      {children}

      <AnimatePresence>
        {modals.map((modal) => (
          <Modal key={modal.id} open={true} onOpenChange={() => handleCancel(modal)}>
            <ModalContent
              className={`${getSizeClasses(modal.size)}`}
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ModalHeader>
                  <ModalTitle>{modal.title}</ModalTitle>
                  {modal.description && (
                    <ModalDescription>{modal.description}</ModalDescription>
                  )}
                </ModalHeader>

                {modal.content && (
                  <div className="py-4">{modal.content}</div>
                )}

                <ModalFooter>
                  {modal.variant !== 'alert' && (
                    <button
                      type="button"
                      onClick={() => handleCancel(modal)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                      {modal.cancelText || 'Cancelar'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleConfirm(modal)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    {modal.confirmText || 'Aceptar'}
                  </button>
                </ModalFooter>
              </motion.div>
            </ModalContent>
          </Modal>
        ))}
      </AnimatePresence>
    </ModalManagerContext.Provider>
  );
};