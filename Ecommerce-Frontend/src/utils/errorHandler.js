/**
 * Comprehensive error handling utility for the ecommerce application
 */

/**
 * Parse and format error messages from API responses
 * @param {Error} error - The error object from axios or other sources
 * @param {string} defaultMessage - Default message if no specific error found
 * @returns {Object} - Formatted error information
 */
export const parseError = (error, defaultMessage = "An unexpected error occurred") => {
  console.error("Error Details:", {
    message: error.message,
    response: error.response,
    status: error.response?.status,
    data: error.response?.data,
    config: error.config,
    stack: error.stack
  });

  let errorInfo = {
    message: defaultMessage,
    status: null,
    type: 'unknown',
    details: null
  };

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    errorInfo.status = status;
    errorInfo.type = 'server';
    errorInfo.details = data;

    switch (status) {
      case 400:
        errorInfo.message = `Bad Request: ${data?.message || data?.error || 'Invalid request data'}`;
        break;
      case 401:
        errorInfo.message = "Authentication failed. Please login again.";
        errorInfo.type = 'auth';
        break;
      case 403:
        errorInfo.message = "Access denied. You don't have permission for this action.";
        errorInfo.type = 'auth';
        break;
      case 404:
        errorInfo.message = `Not Found: ${data?.message || 'The requested resource was not found'}`;
        break;
      case 409:
        errorInfo.message = `Conflict: ${data?.message || 'Resource conflict occurred'}`;
        break;
      case 422:
        errorInfo.message = `Validation Error: ${data?.message || 'Invalid data provided'}`;
        break;
      case 429:
        errorInfo.message = "Too many requests. Please try again later.";
        break;
      case 500:
        errorInfo.message = `Server Error: ${data?.message || 'Internal server error occurred'}`;
        errorInfo.type = 'server';
        break;
      case 502:
        errorInfo.message = "Bad Gateway: Server is temporarily unavailable";
        errorInfo.type = 'server';
        break;
      case 503:
        errorInfo.message = "Service Unavailable: Server is temporarily down";
        errorInfo.type = 'server';
        break;
      default:
        errorInfo.message = `HTTP ${status}: ${data?.message || data?.error || error.message}`;
    }
  } else if (error.request) {
    // Network error
    errorInfo.type = 'network';
    errorInfo.message = "Network error: Unable to connect to server. Please check your internet connection.";
  } else {
    // Other error
    errorInfo.type = 'client';
    errorInfo.message = `Error: ${error.message}`;
  }

  return errorInfo;
};

/**
 * Handle errors for product operations
 * @param {Error} error - The error object
 * @param {string} operation - The operation being performed (add, update, delete, etc.)
 * @returns {string} - User-friendly error message
 */
export const handleProductError = (error, operation = 'process') => {
  const errorInfo = parseError(error, `Failed to ${operation} product`);
  
  // Add operation-specific context
  if (errorInfo.type === 'auth') {
    return `Authentication required to ${operation} products. Please login as an admin.`;
  }
  
  if (errorInfo.status === 404 && operation === 'update') {
    return "Product not found. It may have been deleted by another admin.";
  }
  
  if (errorInfo.status === 409 && operation === 'add') {
    return "Product already exists with this name or identifier.";
  }
  
  return errorInfo.message;
};

/**
 * Handle errors for cart operations
 * @param {Error} error - The error object
 * @param {string} operation - The operation being performed
 * @returns {string} - User-friendly error message
 */
export const handleCartError = (error, operation = 'update cart') => {
  const errorInfo = parseError(error, `Failed to ${operation}`);
  
  if (errorInfo.type === 'network') {
    return "Unable to update cart. Please check your connection and try again.";
  }
  
  return errorInfo.message;
};

/**
 * Handle errors for authentication operations
 * @param {Error} error - The error object
 * @param {string} operation - The operation being performed (login, register, etc.)
 * @returns {string} - User-friendly error message
 */
export const handleAuthError = (error, operation = 'authenticate') => {
  const errorInfo = parseError(error, `Failed to ${operation}`);
  
  if (errorInfo.status === 401) {
    return operation === 'login' 
      ? "Invalid username or password. Please try again."
      : "Authentication failed. Please login again.";
  }
  
  if (errorInfo.status === 409 && operation === 'register') {
    return "An account with this email or username already exists.";
  }
  
  return errorInfo.message;
};

/**
 * Handle errors for order operations
 * @param {Error} error - The error object
 * @param {string} operation - The operation being performed
 * @returns {string} - User-friendly error message
 */
export const handleOrderError = (error, operation = 'process order') => {
  const errorInfo = parseError(error, `Failed to ${operation}`);
  
  if (errorInfo.status === 400) {
    return "Invalid order data. Please check your cart and try again.";
  }
  
  if (errorInfo.status === 402) {
    return "Payment failed. Please check your payment details and try again.";
  }
  
  return errorInfo.message;
};

/**
 * Log error for debugging purposes
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
export const logError = (error, context = 'Unknown') => {
  const timestamp = new Date().toISOString();
  console.group(`🚨 Error in ${context} at ${timestamp}`);
  console.error("Error:", error);
  console.error("Stack:", error.stack);
  if (error.response) {
    console.error("Response:", error.response);
  }
  if (error.config) {
    console.error("Request Config:", {
      url: error.config.url,
      method: error.config.method,
      headers: error.config.headers,
      data: error.config.data
    });
  }
  console.groupEnd();
};

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  SERVER: 'server',
  AUTH: 'auth',
  CLIENT: 'client',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
};
