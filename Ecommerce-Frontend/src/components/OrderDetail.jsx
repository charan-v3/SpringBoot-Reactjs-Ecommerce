import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from '../axios';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      let response;
      
      if (isAdmin()) {
        // Admin can view any order
        response = await axios.get(`/orders/admin/order/${orderId}`);
      } else {
        // Regular users can only view their own orders
        response = await axios.get(`/orders/${orderId}`);
      }
      
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response?.status === 404) {
        setError('Order not found or you do not have permission to view it.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this order.');
      } else {
        setError('Failed to load order details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (!isAdmin()) return;
    
    try {
      setUpdatingStatus(true);
      await axios.put(`/orders/admin/${orderId}/status`, {
        status: newStatus
      });
      
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'CONFIRMED': return 'bg-info';
      case 'PROCESSING': return 'bg-primary';
      case 'SHIPPED': return 'bg-secondary';
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading order details...</p>
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
            <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <h3>Order not found</h3>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-0">
              <i className="bi bi-receipt me-2"></i>
              Order #{order.orderNumber}
            </h1>
            <p className="text-muted mb-0">Order placed on {formatDate(order.orderDate)}</p>
          </div>
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
            {isAdmin() && (
              <div className="dropdown d-inline">
                <button
                  className="btn btn-primary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-gear me-2"></i>
                      Update Status
                    </>
                  )}
                </button>
                <ul className="dropdown-menu">
                  {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
                    <li key={status}>
                      <button
                        className="dropdown-item"
                        onClick={() => updateOrderStatus(status)}
                        disabled={order.status === status}
                      >
                        {status}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          {/* Order Information */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Order Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Order Number:</strong> {order.orderNumber}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </p>
                    <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                    {order.deliveryDate && (
                      <p><strong>Delivery Date:</strong> {formatDate(order.deliveryDate)}</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <p><strong>Total Amount:</strong> ₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    {order.paymentMethod && (
                      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                    )}
                    {order.paymentStatus && (
                      <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                    )}
                    {order.paymentId && (
                      <p><strong>Payment ID:</strong> {order.paymentId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-box me-2"></i>
                  Order Items
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <strong>{item.productName}</strong>
                              {item.productBrand && (
                                <>
                                  <br />
                                  <small className="text-muted">{item.productBrand}</small>
                                </>
                              )}
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td><strong>₹{item.totalPrice.toLocaleString('en-IN')}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th colSpan="3">Total Amount</th>
                        <th>₹{order.totalAmount.toLocaleString('en-IN')}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-person me-2"></i>
                  Customer Information
                </h5>
              </div>
              <div className="card-body">
                {order.customerName ? (
                  <>
                    <p><strong>Name:</strong> {order.customerName}</p>
                    <p><strong>Email:</strong> {order.customerEmail}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Guest Customer</strong></p>
                    {order.guestCustomerName && (
                      <p><strong>Name:</strong> {order.guestCustomerName}</p>
                    )}
                    {order.guestCustomerEmail && (
                      <p><strong>Email:</strong> {order.guestCustomerEmail}</p>
                    )}
                  </>
                )}
                {order.phoneNumber && (
                  <p><strong>Phone:</strong> {order.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Shipping Information
                </h5>
              </div>
              <div className="card-body">
                <p><strong>Address:</strong></p>
                <p>{order.shippingAddress}</p>
                {order.notes && (
                  <>
                    <p><strong>Notes:</strong></p>
                    <p>{order.notes}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
