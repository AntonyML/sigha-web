import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  backButton?: {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: string;
  };
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon = 'bi-info-circle',
  backButton,
  className = ''
}) => {
  return (
    <div className={`d-flex justify-content-between align-items-center mb-4 ${className}`}>
      <div>
        <h2 className="mb-1">
          <i className={`bi ${icon} me-2`}></i>
          {title}
        </h2>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {backButton && (
        <button
          className="btn btn-outline-secondary"
          onClick={backButton.onClick}
          disabled={backButton.disabled}
        >
          <i className={`bi ${backButton.icon || 'bi-arrow-left'} me-2`}></i>
          {backButton.text}
        </button>
      )}
    </div>
  );
};