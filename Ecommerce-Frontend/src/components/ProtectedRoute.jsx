import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireCustomer = false }) => {
  const { isAuthenticated, isAdmin, isCustomer } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/customer/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireCustomer && !isCustomer()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
