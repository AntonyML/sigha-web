import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../../utils/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
  {
    variants: {
      variant: {
        success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-50 dark:border-green-800',
        error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-50 dark:border-red-800',
        warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-50 dark:border-yellow-800',
        info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-50 dark:border-blue-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  success: 'bi-check-circle-fill',
  error: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-triangle',
  info: 'bi-info-circle-fill',
};

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  children: React.ReactNode;
  icon?: string;
  onClose?: () => void;
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, children, icon, onClose, className }, ref) => {
    const defaultIcon = variant ? iconMap[variant] : iconMap.info;

    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)}>
        <div className="flex gap-3">
          <i className={`bi ${icon || defaultIcon} text-lg flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            {title && <div className="font-semibold mb-1">{title}</div>}
            <div className="text-sm">{children}</div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 ml-auto opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Cerrar"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
