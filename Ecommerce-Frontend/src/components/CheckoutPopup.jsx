import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { showErrorToast, showSuccessToast } from '../utils/toast';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!shippingAddress.trim()) {
      showErrorToast('Please enter a shipping address');
      return;
    }
    if (!phoneNumber.trim()) {
      showErrorToast('Please enter a phone number');
      return;
    }

    setIsProcessing(true);
    try {
      await handleCheckout({
        shippingAddress,
        phoneNumber,
        notes,
        method: 'COD', // Cash on Delivery
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      });

      // Reset form on success
      setShippingAddress('');
      setPhoneNumber('');
      setNotes('');

    } catch (error) {
      console.error('Checkout failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Order placement failed. Please try again.';
      showErrorToast(errorMessage, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkoutPopup">
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-bag-check me-2"></i>
            Complete Your Order
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="checkout-content">
            {/* Order Summary */}
            <div className="order-summary mb-4">
              <h6 className="mb-3">Order Summary</h6>
              <div className="checkout-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-item d-flex align-items-center mb-3 p-3 border rounded">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="checkout-item-image me-3"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted mb-1">{item.brand}</p>
                      <div className="d-flex justify-content-between">
                        <span>Quantity: {item.quantity}</span>
                        <span className="fw-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="total-section p-3 bg-light rounded">
                  <h5 className="text-center mb-0">
                    Total: ₹{totalPrice.toLocaleString('en-IN')}
                  </h5>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="shipping-info">
              <h6 className="mb-3">Shipping Information</h6>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Shipping Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter your complete shipping address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Order Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Any special instructions for your order"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="d-flex align-items-center"
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-credit-card me-2"></i>
                Place Order
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckoutPopup;
