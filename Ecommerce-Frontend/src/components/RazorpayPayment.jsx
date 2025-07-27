import React, { useState } from 'react';
import UPIQRCode from './UPIQRCode';

const RazorpayPayment = ({ amount, onSuccess, onFailure, orderData }) => {
  const [loading, setLoading] = useState(false);
  const [showUPIQR, setShowUPIQR] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const generateUPIQR = () => {
    const upiId = '9976656631@axl'; // Your UPI ID
    const merchantName = 'Ecommerce Store';
    const transactionNote = `Payment for Order #${orderData?.orderNumber || 'N/A'}`;

    // UPI URL format
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

    return upiUrl;
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id', // Replace with your Razorpay key
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Ecommerce Store',
      description: `Payment for Order #${orderData?.orderNumber || 'N/A'}`,
      image: '/logo192.png', // Your logo
      order_id: orderData?.razorpayOrderId, // This should come from backend
      handler: function (response) {
        // Payment successful
        console.log('Payment successful:', response);
        if (onSuccess) {
          onSuccess({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
        }
        setLoading(false);
      },
      prefill: {
        name: orderData?.customerName || '',
        email: orderData?.customerEmail || '',
        contact: orderData?.customerPhone || ''
      },
      notes: {
        address: orderData?.shippingAddress || ''
      },
      theme: {
        color: '#667eea'
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
          if (onFailure) {
            onFailure('Payment cancelled by user');
          }
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      if (onFailure) {
        onFailure(response.error.description);
      }
      setLoading(false);
    });

    paymentObject.open();
  };

  const handleUPIPayment = () => {
    setShowUPIQR(true);
  };

  return (
    <div className="razorpay-payment">
      <div className="payment-options">
        <h5 className="mb-4">
          <i className="bi bi-credit-card me-2"></i>
          Choose Payment Method
        </h5>
        
        <div className="row">
          {/* Razorpay Payment */}
          <div className="col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-credit-card" style={{ fontSize: '3rem', color: '#667eea' }}></i>
                <h6 className="mt-3">Card/Wallet/NetBanking</h6>
                <p className="text-muted small">Pay securely using Razorpay</p>
                <button 
                  className="btn btn-primary w-100"
                  onClick={handleRazorpayPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2"></i>
                      Pay ₹{amount.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* UPI Payment */}
          <div className="col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <i className="bi bi-phone" style={{ fontSize: '3rem', color: '#00C851' }}></i>
                <h6 className="mt-3">UPI Payment</h6>
                <p className="text-muted small">Pay using any UPI app</p>
                <button 
                  className="btn btn-success w-100"
                  onClick={handleUPIPayment}
                >
                  <i className="bi bi-qr-code me-2"></i>
                  Pay via UPI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="payment-summary mt-4">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-receipt me-2"></i>
                Payment Summary
              </h6>
              <div className="row">
                <div className="col-6">
                  <strong>Order Number:</strong><br />
                  {orderData?.orderNumber || 'N/A'}
                </div>
                <div className="col-6">
                  <strong>Amount:</strong><br />
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-12">
                  <strong>UPI ID for Direct Transfer:</strong><br />
                  <code>9976656631@axl</code>
                  <button
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={() => navigator.clipboard.writeText('9976656631@axl')}
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="security-notice mt-3">
          <div className="alert alert-info border-0" style={{ borderRadius: '10px' }}>
            <i className="bi bi-shield-check me-2"></i>
            <strong>Secure Payment:</strong> Your payment information is encrypted and secure. 
            We use industry-standard security measures to protect your data.
          </div>
        </div>

        {/* UPI QR Code Modal */}
        {showUPIQR && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-qr-code me-2"></i>
                    UPI Payment
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUPIQR(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <UPIQRCode
                    amount={amount}
                    orderNumber={orderData?.orderNumber || 'N/A'}
                    upiId="9976656631@axl"
                  />
                </div>
                <div className="modal-footer">
                  <div className="w-100">
                    {!paymentConfirmed ? (
                      <>
                        <div className="mb-3">
                          <label className="form-label">
                            <strong>Enter UPI Transaction ID:</strong>
                            <small className="text-muted d-block">
                              After completing payment, enter the transaction ID from your UPI app
                            </small>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., 123456789012"
                            value={upiTransactionId}
                            onChange={(e) => setUpiTransactionId(e.target.value)}
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary flex-fill"
                            onClick={() => setShowUPIQR(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-success flex-fill"
                            onClick={() => {
                              if (!upiTransactionId.trim()) {
                                alert('Please enter the UPI transaction ID');
                                return;
                              }
                              setPaymentConfirmed(true);
                              setShowUPIQR(false);
                              if (onSuccess) {
                                onSuccess({
                                  paymentMethod: 'UPI',
                                  upiTransactionId: upiTransactionId.trim(),
                                  amount: amount,
                                  timestamp: new Date().toISOString()
                                });
                              }
                            }}
                            disabled={!upiTransactionId.trim()}
                          >
                            Confirm Payment
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          Payment confirmed! Processing your order...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayPayment;
