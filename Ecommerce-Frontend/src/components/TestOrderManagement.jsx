import React from 'react';
import { useAuth } from '../Context/AuthContext';

const TestOrderManagement = () => {
  const { user, isAdmin } = useAuth();

  console.log('TestOrderManagement component loaded');
  console.log('Current user:', user);
  console.log('Is admin:', isAdmin());

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="alert alert-success" role="alert">
          <h4 className="alert-heading">🎉 Route Working!</h4>
          <p>The /admin/orders route is working correctly!</p>
          <hr />
          <p className="mb-0">
            <strong>User:</strong> {user?.username || 'Not logged in'}<br />
            <strong>Role:</strong> {user?.role || 'No role'}<br />
            <strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}
          </p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h5>Debug Information</h5>
          </div>
          <div className="card-body">
            <p>If you can see this page, the route /admin/orders is working correctly.</p>
            <p>The issue might be with the OrderManagement component itself.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestOrderManagement;
