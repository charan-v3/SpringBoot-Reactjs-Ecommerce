import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import LoadingSpinner from './LoadingSpinner';

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // For guest users, show empty state with tracking option
        setOrders([]);
        setLoading(false);
        return;
      }

      // Only fetch orders for authenticated users
      const response = await axios.get('/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        setError('Please login to view your order history');
        // Clear invalid token
        localStorage.removeItem('token');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view order history');
      } else {
        setError('Failed to load order history');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'PROCESSING': return 'primary';
      case 'SHIPPED': return 'secondary';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return 'bi-clock';
      case 'CONFIRMED': return 'bi-check-circle';
      case 'PROCESSING': return 'bi-gear';
      case 'SHIPPED': return 'bi-truck';
      case 'DELIVERED': return 'bi-check-circle-fill';
      case 'CANCELLED': return 'bi-x-circle';
      default: return 'bi-circle';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <LoadingSpinner size="large" text="Loading your orders..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="error-container">
            <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
            <h2 className="mt-3">Error Loading Orders</h2>
            <p className="text-muted">{error}</p>
            <button className="btn btn-primary mt-3" onClick={fetchOrders}>
              <i className="bi bi-arrow-clockwise me-2"></i>
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
        <div className="order-history-header mb-4">
          <h1 className="text-center mb-2">
            <i className="bi bi-bag-check me-3"></i>
            Order History
          </h1>
          <p className="text-center text-muted">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders text-center py-5">
            <i className="bi bi-bag" style={{ fontSize: '4rem', color: 'var(--text-muted)' }}></i>
            <h3 className="mt-3">No Orders Yet</h3>
            <p className="text-muted mb-4">You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <i className="bi bi-shop me-2"></i>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card card mb-4 fade-in-up">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">
                      <i className="bi bi-receipt me-2"></i>
                      Order #{order.orderNumber}
                    </h5>
                    <small className="text-muted">
                      Placed on {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <span className={`badge bg-${getStatusColor(order.status)} d-flex align-items-center`}>
                    <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
                    {order.status}
                  </span>
                </div>
                
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h6 className="mb-3">Items Ordered:</h6>
                      <div className="order-items">
                        {order.items.map((item) => (
                          <div key={item.id} className="order-item d-flex align-items-center mb-3 p-2 border rounded">
                            <div className="item-details flex-grow-1">
                              <h6 className="mb-1">{item.productName}</h6>
                              <p className="text-muted mb-1">{item.productBrand}</p>
                              <div className="d-flex justify-content-between">
                                <span>Qty: {item.quantity}</span>
                                <span className="fw-bold">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="order-summary">
                        <h6 className="mb-3">Order Summary</h6>
                        <div className="summary-item d-flex justify-content-between mb-2">
                          <span>Total Amount:</span>
                          <span className="fw-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        
                        {order.shippingAddress && (
                          <div className="shipping-info mt-3">
                            <h6 className="mb-2">Shipping Address:</h6>
                            <p className="text-muted small">{order.shippingAddress}</p>
                          </div>
                        )}
                        
                        {order.phoneNumber && (
                          <div className="contact-info">
                            <h6 className="mb-2">Contact:</h6>
                            <p className="text-muted small">{order.phoneNumber}</p>
                          </div>
                        )}
                        
                        {order.deliveryDate && (
                          <div className="delivery-info mt-3">
                            <h6 className="mb-2">Delivered On:</h6>
                            <p className="text-success small">
                              {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="order-notes mt-3 p-3 bg-light rounded">
                      <h6 className="mb-2">Order Notes:</h6>
                      <p className="mb-0 text-muted">{order.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="card-footer d-flex justify-content-between align-items-center">
                  <div className="order-actions">
                    <button 
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => navigate(`/order/${order.id}`)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Details
                    </button>
                    {order.status === 'DELIVERED' && (
                      <button className="btn btn-outline-success btn-sm">
                        <i className="bi bi-star me-1"></i>
                        Rate Order
                      </button>
                    )}
                  </div>
                  
                  <div className="order-total">
                    <span className="text-muted">Total: </span>
                    <span className="fw-bold h5">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
