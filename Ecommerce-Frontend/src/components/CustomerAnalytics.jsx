import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const CustomerAnalytics = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'username',
    sortOrder: 'asc',
    minVisits: '',
    maxVisits: '',
    minPurchases: '',
    maxPurchases: '',
    dateFrom: '',
    dateTo: '',
    showActiveOnly: false
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/unauthorized');
      return;
    }
    fetchCustomers();
  }, [isAdmin, navigate]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/analytics/customers/filtered');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const response = await axios.get('/analytics/customers/filtered', {
        params: {
          ...filters,
          minVisits: filters.minVisits || undefined,
          maxVisits: filters.maxVisits || undefined,
          minPurchases: filters.minPurchases || undefined,
          maxPurchases: filters.maxPurchases || undefined
        }
      });
      setFilteredCustomers(response.data);
    } catch (error) {
      // Handle filter error silently
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      sortBy: 'username',
      sortOrder: 'asc',
      minVisits: '',
      maxVisits: '',
      minPurchases: '',
      maxPurchases: '',
      dateFrom: '',
      dateTo: '',
      showActiveOnly: false
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Username', 'Email', 'Name', 'Visit Count', 'Purchase Count', 'Last Visit', 'Member Since'],
      ...filteredCustomers.map(customer => [
        customer.username,
        customer.email,
        `${customer.firstName} ${customer.lastName}`,
        customer.visitCount,
        customer.purchaseCount,
        customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString() : 'Never',
        new Date(customer.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading customer analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="customer-analytics">
          {/* Header */}
          <div className="dashboard-header mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="h2 mb-0">
                  <i className="bi bi-people me-2"></i>
                  Customer Analytics
                </h1>
                <p className="text-muted mb-0">Detailed customer insights and filtering</p>
              </div>
              <div className="col-auto">
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-success"
                    onClick={exportToCSV}
                  >
                    <i className="bi bi-download me-2"></i>
                    Export CSV
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={fetchCustomers}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger border-0 text-center" role="alert" style={{ borderRadius: '10px' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-funnel me-2"></i>
                Filters & Search
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, username, email..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="username">Username</option>
                    <option value="email">Email</option>
                    <option value="visitCount">Visit Count</option>
                    <option value="purchaseCount">Purchase Count</option>
                    <option value="createdAt">Member Since</option>
                  </select>
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Order</label>
                  <select
                    className="form-select"
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Min Visits</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={filters.minVisits}
                    onChange={(e) => handleFilterChange('minVisits', e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Max Visits</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="∞"
                    value={filters.maxVisits}
                    onChange={(e) => handleFilterChange('maxVisits', e.target.value)}
                  />
                </div>
                <div className="col-md-1 mb-3 d-flex align-items-end">
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-2 mb-3">
                  <label className="form-label">Min Purchases</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={filters.minPurchases}
                    onChange={(e) => handleFilterChange('minPurchases', e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Max Purchases</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="∞"
                    value={filters.maxPurchases}
                    onChange={(e) => handleFilterChange('maxPurchases', e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={filters.showActiveOnly}
                      onChange={(e) => handleFilterChange('showActiveOnly', e.target.checked)}
                    />
                    <label className="form-check-label">
                      Active Only
                    </label>
                  </div>
                </div>
                <div className="col-md-2 mb-3 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={applyFilters}
                  >
                    <i className="bi bi-search me-2"></i>
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="bi bi-table me-2"></i>
                  Customer Data ({filteredCustomers.length} results)
                </h5>
              </div>
            </div>
            <div className="card-body">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-search" style={{ fontSize: '4rem', color: 'var(--bs-secondary)' }}></i>
                  <h4 className="mt-3">No Customers Found</h4>
                  <p className="text-muted">Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Contact</th>
                        <th>Activity</th>
                        <th>Engagement</th>
                        <th>Member Since</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td>
                            <div>
                              <strong>{customer.firstName} {customer.lastName}</strong><br />
                              <small className="text-muted">@{customer.username}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              {customer.email}<br />
                              <small className="text-muted">{customer.phoneNumber || 'No phone'}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-3">
                              <div className="text-center">
                                <div className="fw-bold text-primary">{customer.visitCount}</div>
                                <small className="text-muted">Visits</small>
                              </div>
                              <div className="text-center">
                                <div className="fw-bold text-success">{customer.purchaseCount}</div>
                                <small className="text-muted">Purchases</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <small className="text-muted">Last Visit:</small><br />
                              {customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString() : 'Never'}
                            </div>
                          </td>
                          <td>
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => navigate(`/analytics/customer/${customer.id}`)}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
