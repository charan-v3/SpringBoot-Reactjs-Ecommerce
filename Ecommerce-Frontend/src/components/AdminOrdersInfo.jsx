import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminOrdersInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-4">
                  <i className="bi bi-info-circle text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="card-title">Admin Order Management</h3>
                <p className="card-text text-muted mb-4">
                  As an administrator, you have access to comprehensive order management tools. 
                  Use the admin-specific order management interface to view and manage all customer orders.
                </p>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="bi bi-gear me-2"></i>
                          Admin Features
                        </h5>
                        <ul className="list-unstyled text-start">
                          <li><i className="bi bi-check text-success me-2"></i>View all customer orders</li>
                          <li><i className="bi bi-check text-success me-2"></i>Update order status</li>
                          <li><i className="bi bi-check text-success me-2"></i>Filter and search orders</li>
                          <li><i className="bi bi-check text-success me-2"></i>Order analytics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="bi bi-shield-check me-2"></i>
                          Security Note
                        </h5>
                        <p className="text-start small">
                          Admin and customer order interfaces are separated for security. 
                          This ensures proper access control and data protection.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/orders')}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Go to Order Management
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    <i className="bi bi-speedometer2 me-2"></i>
                    Admin Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersInfo;
