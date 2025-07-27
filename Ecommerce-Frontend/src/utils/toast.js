/**
 * Toast notification utility for showing user feedback
 */

export const showToast = (message, type = 'info', duration = 3000, details = null) => {
  // Remove any existing toasts first
  const existingToasts = document.querySelectorAll('.custom-toast');
  existingToasts.forEach(toast => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  });

  // Determine alert class and icon based on type
  let alertClass, icon;
  switch (type) {
    case 'success':
      alertClass = 'alert-success';
      icon = 'bi-check-circle';
      break;
    case 'error':
    case 'danger':
      alertClass = 'alert-danger';
      icon = 'bi-exclamation-circle';
      break;
    case 'warning':
      alertClass = 'alert-warning';
      icon = 'bi-exclamation-triangle';
      break;
    case 'info':
    default:
      alertClass = 'alert-info';
      icon = 'bi-info-circle';
      break;
  }

  // Create toast element
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed custom-toast`;
  alertDiv.style.cssText = `
    top: 20px; 
    right: 20px; 
    z-index: 9999; 
    min-width: 300px; 
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border: none;
    border-radius: 8px;
  `;
  
  // Create detailed message with expandable details if provided
  const detailsHtml = details ? `
    <details class="mt-2">
      <summary style="cursor: pointer; font-size: 0.9rem;">
        <small>Show Details</small>
      </summary>
      <div class="mt-1" style="font-size: 0.85rem; opacity: 0.9;">
        ${typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
      </div>
    </details>
  ` : '';

  alertDiv.innerHTML = `
    <div class="d-flex align-items-start">
      <i class="bi ${icon} me-2" style="font-size: 1.1rem; margin-top: 2px;"></i>
      <div class="flex-grow-1">
        <div>${message}</div>
        ${detailsHtml}
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // Add to document
  document.body.appendChild(alertDiv);

  // Auto remove after specified duration
  const timeout = setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.classList.remove('show');
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.parentNode.removeChild(alertDiv);
        }
      }, 150); // Wait for fade out animation
    }
  }, duration);

  // Handle manual close
  const closeButton = alertDiv.querySelector('.btn-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      clearTimeout(timeout);
      if (alertDiv.parentNode) {
        alertDiv.classList.remove('show');
        setTimeout(() => {
          if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
          }
        }, 150);
      }
    });
  }

  return alertDiv;
};

// Convenience methods
export const showSuccessToast = (message, duration, details) => showToast(message, 'success', duration, details);
export const showErrorToast = (message, duration, details) => showToast(message, 'error', duration, details);
export const showWarningToast = (message, duration, details) => showToast(message, 'warning', duration, details);
export const showInfoToast = (message, duration, details) => showToast(message, 'info', duration, details);

// Error-specific toast with detailed information
export const showDetailedErrorToast = (error, context = 'Operation') => {
  const errorInfo = typeof error === 'string' ? { message: error } : error;
  const message = errorInfo.message || 'An error occurred';
  const details = errorInfo.details || errorInfo.stack || null;

  showToast(
    `${context} Failed: ${message}`,
    'error',
    6000, // Longer duration for errors
    details
  );
};
