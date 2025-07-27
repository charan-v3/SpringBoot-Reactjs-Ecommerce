import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const OrderManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/unauthorized');
      return;
    }
    fetchOrders();
  }, [isAdmin, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/orders/admin/all');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
      
      await axios.put(`/orders/admin/${orderId}/status`, {
        status: newStatus
      });
      
      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
      
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'CONFIRMED': return 'bg-info';
      case 'PROCESSING': return 'bg-primary';
      case 'SHIPPED': return 'bg-secondary';
      case 'OUT_FOR_DELIVERY': return 'bg-warning';
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'CONFIRMED': return 'Confirmed';
      case 'PROCESSING': return 'Processing';
      case 'SHIPPED': return 'Shipped';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED'];
      case 'PROCESSING':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['OUT_FOR_DELIVERY', 'DELIVERED'];
      case 'OUT_FOR_DELIVERY':
        return ['DELIVERED'];
      case 'DELIVERED':
        return []; // No further status changes
      case 'CANCELLED':
        return []; // No further status changes
      default:
        return ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading orders...</p>
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
            <button className="btn btn-outline-danger" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="order-management">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h2 mb-0">
                <i className="bi bi-bag-check me-2"></i>
                Order Management
              </h1>
              <p className="text-muted mb-0">Manage and track all customer orders</p>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={fetchOrders}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Filter by Status</label>
                  <select 
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Orders</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Search Orders</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by order number or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Orders Summary */}
          <div className="row mb-4">
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-primary">{orders.length}</h4>
                  <small className="text-muted">Total Orders</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-warning">{orders.filter(o => o.status === 'PENDING').length}</h4>
                  <small className="text-muted">Pending</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-info">{orders.filter(o => o.status === 'PROCESSING').length}</h4>
                  <small className="text-muted">Processing</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-secondary">{orders.filter(o => o.status === 'SHIPPED').length}</h4>
                  <small className="text-muted">Shipped</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-warning">{orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length}</h4>
                  <small className="text-muted">Out for Delivery</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h4 className="text-success">{orders.filter(o => o.status === 'DELIVERED').length}</h4>
                  <small className="text-muted">Delivered</small>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                Orders ({filteredOrders.length})
              </h5>
            </div>
            <div className="card-body p-0">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                  <h4 className="mt-3">No Orders Found</h4>
                  <p className="text-muted">No orders match your current filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>{order.orderNumber}</strong>
                          </td>
                          <td>
                            {order.customerName || order.guestCustomerName || 'Guest Customer'}
                            {order.customerEmail && (
                              <>
                                <br />
                                <small className="text-muted">{order.customerEmail}</small>
                              </>
                            )}
                          </td>
                          <td>
                            {formatDate(order.orderDate)}
                          </td>
                          <td>
                            <strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {getStatusDisplayName(order.status)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/admin/order/${order.id}`)}
                                title="View Order Details"
                              >
                                <i className="bi bi-eye"></i>
                              </button>

                              {getNextStatusOptions(order.status).length > 0 && (
                                <div className="dropdown">
                                  <button
                                    className="btn btn-sm btn-outline-success dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    disabled={updatingStatus[order.id]}
                                    title="Update Order Status"
                                  >
                                    {updatingStatus[order.id] ? (
                                      <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                      <>
                                        <i className="bi bi-arrow-up-circle me-1"></i>
                                        Update
                                      </>
                                    )}
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li><h6 className="dropdown-header">Change Status To:</h6></li>
                                    {getNextStatusOptions(order.status).map(status => (
                                      <li key={status}>
                                        <button
                                          className="dropdown-item d-flex align-items-center"
                                          onClick={() => updateOrderStatus(order.id, status)}
                                        >
                                          <span className={`badge ${getStatusBadgeClass(status)} me-2`} style={{fontSize: '0.7em'}}>
                                            {getStatusDisplayName(status)}
                                          </span>
                                          {status === 'CONFIRMED' && <i className="bi bi-check-circle text-info ms-auto"></i>}
                                          {status === 'PROCESSING' && <i className="bi bi-gear text-primary ms-auto"></i>}
                                          {status === 'SHIPPED' && <i className="bi bi-truck text-secondary ms-auto"></i>}
                                          {status === 'OUT_FOR_DELIVERY' && <i className="bi bi-geo-alt text-warning ms-auto"></i>}
                                          {status === 'DELIVERED' && <i className="bi bi-check-circle-fill text-success ms-auto"></i>}
                                          {status === 'CANCELLED' && <i className="bi bi-x-circle text-danger ms-auto"></i>}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {getNextStatusOptions(order.status).length === 0 && (
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  disabled
                                  title="No further status changes available"
                                >
                                  <i className="bi bi-lock"></i>
                                </button>
                              )}
                            </div>
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

export default OrderManagement;
