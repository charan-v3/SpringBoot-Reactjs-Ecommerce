import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/unauthorized');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Making API calls with token:', token.substring(0, 20) + '...');

      const [dashboardResponse, adminStatsResponse] = await Promise.all([
        axios.get('/analytics/admin/dashboard', config),
        axios.get('/admin/verification/count', config)
      ]);

      console.log('Dashboard response:', dashboardResponse.data);
      console.log('Admin stats response:', adminStatsResponse.data);

      // Ensure we're working with an object, not a string
      let data;
      if (typeof dashboardResponse.data === 'string') {
        try {
          data = JSON.parse(dashboardResponse.data);
        } catch (e) {
          console.error('Failed to parse dashboard response:', e);
          throw new Error('Invalid response format from server');
        }
      } else {
        data = { ...dashboardResponse.data }; // Create a copy to avoid mutation
      }

      // Safely update admin stats
      if (data.adminStats) {
        data.adminStats.pendingAdmins = adminStatsResponse.data.count || 0;
      } else {
        data.adminStats = {
          pendingAdmins: adminStatsResponse.data.count || 0
        };
      }

      console.log('Final dashboard data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(`Failed to load dashboard data: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={fetchDashboardData}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const customerAnalytics = dashboardData?.customerAnalytics || {};
  const orderAnalytics = dashboardData?.orderAnalytics || {};
  const productAnalytics = dashboardData?.productAnalytics || {};
  const adminStats = dashboardData?.adminStats || {};

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="admin-dashboard">
          {/* Header */}
          <div className="dashboard-header mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="h2 mb-0">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Admin Dashboard
                </h1>
                <p className="text-muted mb-0">Welcome back, {user?.username}!</p>
              </div>
              <div className="col-auto">
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/add_product')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Product
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={fetchDashboardData}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-2 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Pending Admins</h6>
                      <h3 className="mb-0">{adminStats.pendingAdmins || 0}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-person-check fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-2 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Total Customers</h6>
                      <h3 className="mb-0">{customerAnalytics.totalCustomers || 0}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-people fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-2 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Total Orders</h6>
                      <h3 className="mb-0">{orderAnalytics.totalOrders || 0}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-bag-check fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-2 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Total Products</h6>
                      <h3 className="mb-0">{productAnalytics.totalProducts || 0}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-box-seam fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-2 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Total Revenue</h6>
                      <h3 className="mb-0">₹{(orderAnalytics.totalRevenue || 0).toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-currency-rupee fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Customer Analytics
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-6">
                      <h4 className="text-primary">{customerAnalytics.totalVisits || 0}</h4>
                      <small className="text-muted">Total Visits</small>
                    </div>
                    <div className="col-6">
                      <h4 className="text-success">{customerAnalytics.totalPurchases || 0}</h4>
                      <small className="text-muted">Total Purchases</small>
                    </div>
                  </div>
                  <hr />
                  <div className="row text-center">
                    <div className="col-6">
                      <h6 className="text-info">{(customerAnalytics.averageVisitsPerCustomer || 0).toFixed(1)}</h6>
                      <small className="text-muted">Avg Visits/Customer</small>
                    </div>
                    <div className="col-6">
                      <h6 className="text-warning">{(customerAnalytics.averagePurchasesPerCustomer || 0).toFixed(1)}</h6>
                      <small className="text-muted">Avg Purchases/Customer</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-bag me-2"></i>
                    Order Analytics
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-4">
                      <h4 className="text-warning">{orderAnalytics.pendingOrders || 0}</h4>
                      <small className="text-muted">Pending</small>
                    </div>
                    <div className="col-4">
                      <h4 className="text-success">{orderAnalytics.completedOrders || 0}</h4>
                      <small className="text-muted">Completed</small>
                    </div>
                    <div className="col-4">
                      <h4 className="text-info">₹{(orderAnalytics.averageOrderValue || 0).toLocaleString('en-IN')}</h4>
                      <small className="text-muted">Avg Order Value</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-lightning me-2"></i>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => navigate('/add_product')}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Product
                      </button>
                    </div>
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={() => navigate('/')}
                      >
                        <i className="bi bi-grid me-2"></i>
                        View All Products
                      </button>
                    </div>
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-info w-100"
                        onClick={() => navigate('/admin/orders')}
                      >
                        <i className="bi bi-bag-check me-2"></i>
                        Manage Orders
                      </button>
                    </div>
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-warning w-100"
                        onClick={() => navigate('/admin/customer-analytics')}
                      >
                        <i className="bi bi-people me-2"></i>
                        Customer Details
                      </button>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => navigate('/admin/verification')}
                      >
                        <i className="bi bi-shield-check me-2"></i>
                        Admin Verification
                        {adminStats.pendingAdmins > 0 && (
                          <span className="badge bg-warning text-dark ms-2">
                            {adminStats.pendingAdmins}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => navigate('/admin/customer-analytics')}
                      >
                        <i className="bi bi-people me-2"></i>
                        Customer Analytics
                      </button>
                    </div>
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-dark w-100"
                        onClick={() => navigate('/admin/sales-report')}
                      >
                        <i className="bi bi-graph-up me-2"></i>
                        Sales Report
                      </button>
                    </div>
                    <div className="col-md-3 mb-2">
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={() => navigate('/admin/payments')}
                      >
                        <i className="bi bi-credit-card me-2"></i>
                        Payment Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
