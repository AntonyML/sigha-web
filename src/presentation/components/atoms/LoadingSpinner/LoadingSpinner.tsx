import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '3rem', height: '3rem' },
    lg: { width: '5rem', height: '5rem' }
  };

  return (
    <div className={`d-flex justify-content-center align-items-center ${className}`}>
      <div className="text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={sizeClasses[size]}
        >
          <span className="visually-hidden">Cargando...</span>
        </div>
        {message && <p className="mt-3 text-muted">{message}</p>}
      </div>
    </div>
  );
};