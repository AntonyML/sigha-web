import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: string;
  className?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  dismissible = true,
  onDismiss,
  icon,
  className = ''
}) => {
  const getIcon = () => {
    if (icon) return icon;

    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'info':
        return 'bi-info-circle';
      default:
        return 'bi-info-circle';
    }
  };

  return (
    <div
      className={`alert alert-${type} ${dismissible ? 'alert-dismissible fade show' : ''} ${className}`}
      role="alert"
    >
      <i className={`bi ${getIcon()} me-2`}></i>
      {message}
      {dismissible && onDismiss && (
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
        ></button>
      )}
    </div>
  );
};