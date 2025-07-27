import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const orderNum = searchParams.get('orderNumber');
    if (orderNum) {
      setOrderNumber(orderNum);
    }
  }, [searchParams]);

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="order-success-container text-center">
          <div className="success-animation mb-4">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>

          <div className="success-content">
            <h1 className="success-title mb-3">
              <i className="bi bi-check-circle-fill text-success me-3"></i>
              Order Placed Successfully!
            </h1>
            
            <p className="success-message mb-4">
              Thank you for your order, <strong>{user?.username}</strong>! 
              Your order has been confirmed and is being processed.
            </p>

            {orderNumber && (
              <div className="order-details mb-4 p-4 bg-light rounded">
                <h5 className="mb-3">Order Details</h5>
                <div className="order-number">
                  <strong>Order Number: </strong>
                  <span className="badge bg-primary fs-6">{orderNumber}</span>
                </div>
                <p className="text-muted mt-2">
                  Please save this order number for tracking your order.
                </p>
              </div>
            )}

            <div className="success-actions">
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="d-grid gap-3">
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => navigate('/orders')}
                    >
                      <i className="bi bi-clock-history me-2"></i>
                      View Order History
                    </button>
                    
                    <button 
                      className="btn btn-outline-primary btn-lg"
                      onClick={() => navigate('/track-order')}
                    >
                      <i className="bi bi-geo-alt me-2"></i>
                      Track Your Order
                    </button>
                    
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/')}
                    >
                      <i className="bi bi-house me-2"></i>
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="additional-info mt-5">
              <div className="row">
                <div className="col-md-4">
                  <div className="info-card text-center p-3">
                    <i className="bi bi-truck text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                    <h6>Fast Delivery</h6>
                    <p className="text-muted small">Your order will be delivered within 3-5 business days</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="info-card text-center p-3">
                    <i className="bi bi-shield-check text-success mb-2" style={{ fontSize: '2rem' }}></i>
                    <h6>Secure Payment</h6>
                    <p className="text-muted small">Your payment information is safe and secure</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="info-card text-center p-3">
                    <i className="bi bi-headset text-info mb-2" style={{ fontSize: '2rem' }}></i>
                    <h6>24/7 Support</h6>
                    <p className="text-muted small">Contact us anytime for order assistance</p>
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

export default OrderSuccess;
