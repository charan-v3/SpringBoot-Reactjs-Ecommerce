import React, { useState, useEffect } from 'react';

const UPIQRCode = ({ amount, orderNumber, upiId = '9976656631@axl' }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [upiUrl, setUpiUrl] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [amount, orderNumber, upiId]);

  const generateQRCode = () => {
    const merchantName = 'Ecommerce Store';
    const transactionNote = `Payment for Order #${orderNumber}`;
    
    // Generate UPI URL
    const upiPaymentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    setUpiUrl(upiPaymentUrl);
    
    // Generate QR code using Google Charts API
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(upiPaymentUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiId);
  };

  const copyUPIUrl = () => {
    navigator.clipboard.writeText(upiUrl);
  };

  const openUPIApp = () => {
    window.location.href = upiUrl;
  };

  return (
    <div className="upi-qr-code">
      <div className="card">
        <div className="card-header bg-success text-white text-center">
          <h5 className="mb-0">
            <i className="bi bi-qr-code me-2"></i>
            UPI Payment
          </h5>
        </div>
        <div className="card-body text-center">
          {/* QR Code */}
          <div className="qr-code-container mb-4">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="UPI QR Code" 
                className="img-fluid"
                style={{ maxWidth: '200px', border: '2px solid #ddd', borderRadius: '10px' }}
              />
            )}
          </div>

          {/* Payment Details */}
          <div className="payment-details mb-4">
            <div className="row">
              <div className="col-6">
                <strong>Amount:</strong><br />
                <span className="text-success fs-5">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="col-6">
                <strong>Order:</strong><br />
                <span className="text-muted">{orderNumber}</span>
              </div>
            </div>
          </div>

          {/* UPI ID */}
          <div className="upi-id-section mb-4">
            <label className="form-label fw-bold">UPI ID:</label>
            <div className="input-group">
              <input 
                type="text" 
                className="form-control text-center" 
                value={upiId} 
                readOnly 
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={copyUPIId}
                title="Copy UPI ID"
              >
                <i className="bi bi-clipboard"></i>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <div className="d-grid gap-2">
              <button 
                className="btn btn-success btn-lg"
                onClick={openUPIApp}
              >
                <i className="bi bi-phone me-2"></i>
                Pay with UPI App
              </button>
              
              <button 
                className="btn btn-outline-success"
                onClick={copyUPIUrl}
              >
                <i className="bi bi-link me-2"></i>
                Copy Payment Link
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions mt-4">
            <div className="alert alert-info border-0" style={{ borderRadius: '10px' }}>
              <h6 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>
                How to Pay:
              </h6>
              <ol className="mb-0 text-start">
                <li>Scan the QR code with any UPI app</li>
                <li>Or click "Pay with UPI App" button</li>
                <li>Or manually enter the UPI ID: <code>{upiId}</code></li>
                <li>Enter amount: ₹{amount.toLocaleString('en-IN')}</li>
                <li>Add note: Payment for Order #{orderNumber}</li>
                <li>Complete the payment in your UPI app</li>
                <li><strong>Copy the transaction ID from your UPI app</strong></li>
                <li><strong>Enter the transaction ID when prompted</strong></li>
              </ol>
            </div>
          </div>

          {/* Supported Apps */}
          <div className="supported-apps mt-3">
            <small className="text-muted">
              <strong>Supported UPI Apps:</strong><br />
              Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, and more
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIQRCode;
