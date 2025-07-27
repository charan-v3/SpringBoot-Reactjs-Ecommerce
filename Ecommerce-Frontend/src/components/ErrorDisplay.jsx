import React from 'react';

const ErrorDisplay = ({ error, type = 'danger', title = 'Error', showIcon = true, className = '' }) => {
  if (!error) return null;

  const getIconClass = () => {
    switch (type) {
      case 'warning':
        return 'bi-exclamation-triangle text-warning';
      case 'info':
        return 'bi-info-circle text-info';
      case 'success':
        return 'bi-check-circle text-success';
      default:
        return 'bi-exclamation-triangle text-danger';
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      default:
        return 'alert-danger';
    }
  };

  // Parse error message for better formatting
  const formatError = (errorText) => {
    if (typeof errorText !== 'string') return errorText;
    
    // Split by common separators and format
    const parts = errorText.split(/\n\n|\. (?=[A-Z])/);
    
    return parts.map((part, index) => {
      if (part.startsWith('Tip:')) {
        return (
          <div key={index} className="mt-2 p-2 bg-light rounded">
            <small className="text-muted">
              <i className="bi bi-lightbulb me-1"></i>
              {part}
            </small>
          </div>
        );
      }
      return <div key={index} className={index > 0 ? 'mt-1' : ''}>{part}</div>;
    });
  };

  return (
    <div className={`alert ${getAlertClass()} border-0 ${className}`} role="alert" style={{ borderRadius: '10px' }}>
      <div className="d-flex align-items-start">
        {showIcon && (
          <i className={`bi ${getIconClass()} me-2 mt-1`} style={{ fontSize: '1.2rem' }}></i>
        )}
        <div className="flex-grow-1">
          {title && <strong>{title}</strong>}
          <div className={title ? 'mt-1' : ''} style={{ fontSize: '0.9rem' }}>
            {formatError(error)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
