import React, { useState } from 'react';
import axios from '../axios';
import LoadingSpinner from './LoadingSpinner';

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const token = localStorage.getItem('token');
      const config = {};

      // Include authorization header if user is logged in
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      const response = await axios.get(`/orders/track/${orderNumber}`, config);
      setOrder(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Order not found or you do not have permission to view it. Please check your order number.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this order.');
      } else {
        setError('Failed to track order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'PENDING', label: 'Order Placed', icon: 'bi-check-circle' },
      { key: 'CONFIRMED', label: 'Confirmed', icon: 'bi-check-circle-fill' },
      { key: 'PROCESSING', label: 'Processing', icon: 'bi-gear-fill' },
      { key: 'SHIPPED', label: 'Shipped', icon: 'bi-truck' },
      { key: 'DELIVERED', label: 'Delivered', icon: 'bi-house-check-fill' }
    ];

    const currentStatusIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      active: index === currentStatusIndex
    }));
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="order-tracking-header text-center mb-5">
          <h1 className="mb-3">
            <i className="bi bi-geo-alt me-3"></i>
            Track Your Order
          </h1>
          <p className="text-muted">Enter your order number to track your package</p>
        </div>

        <div className="tracking-form-container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <form onSubmit={trackOrder} className="tracking-form">
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Order Number (e.g., ORD20241201123456001)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    disabled={loading}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Tracking...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>
                        Track
                      </>
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center my-5">
            <LoadingSpinner size="medium" text="Tracking your order..." />
          </div>
        )}

        {order && (
          <div className="order-details mt-5 fade-in-up">
            <div className="card">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h4 className="mb-1">
                      <i className="bi bi-receipt me-2"></i>
                      Order #{order.orderNumber}
                    </h4>
                    <p className="text-muted mb-0">
                      Placed on {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <h5 className="mb-0">₹{order.totalAmount.toLocaleString('en-IN')}</h5>
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Order Status Timeline */}
                <div className="order-timeline mb-5">
                  <h5 className="mb-4">Order Status</h5>
                  <div className="timeline">
                    {getStatusSteps().map((step, index) => (
                      <div key={step.key} className={`timeline-item ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                        <div className="timeline-marker">
                          <i className={`bi ${step.icon}`}></i>
                        </div>
                        <div className="timeline-content">
                          <h6 className="mb-1">{step.label}</h6>
                          {step.active && (
                            <small className="text-muted">Current Status</small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Items */}
                <div className="order-items mb-4">
                  <h5 className="mb-3">Items in this order</h5>
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item d-flex align-items-center mb-3 p-3 border rounded">
                      <div className="item-details flex-grow-1">
                        <h6 className="mb-1">{item.productName}</h6>
                        <p className="text-muted mb-1">{item.productBrand}</p>
                        <div className="d-flex justify-content-between">
                          <span>Quantity: {item.quantity}</span>
                          <span className="fw-bold">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Information */}
                <div className="shipping-info">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="mb-3">Shipping Address</h6>
                      <p className="text-muted">{order.shippingAddress}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-3">Contact Information</h6>
                      <p className="text-muted">{order.phoneNumber}</p>
                      
                      {order.deliveryDate && (
                        <div className="mt-3">
                          <h6 className="mb-2">Delivered On</h6>
                          <p className="text-success">
                            {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="order-notes mt-4 p-3 bg-light rounded">
                    <h6 className="mb-2">Order Notes</h6>
                    <p className="mb-0 text-muted">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
