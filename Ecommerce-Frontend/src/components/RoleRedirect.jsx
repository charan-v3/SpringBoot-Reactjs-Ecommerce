import React from 'react';
import { useAuth } from '../Context/AuthContext';
import AdminOrdersInfo from './AdminOrdersInfo';

const RoleRedirect = ({ children, showAdminInfo = false }) => {
  const { isAdmin, isCustomer } = useAuth();

  // If admin tries to access customer orders page, show info
  if (isAdmin() && showAdminInfo) {
    return <AdminOrdersInfo />;
  }

  // If customer or no special handling needed, render children
  if (isCustomer() || !isAdmin()) {
    return children;
  }

  // Default fallback
  return children;
};

export default RoleRedirect;
