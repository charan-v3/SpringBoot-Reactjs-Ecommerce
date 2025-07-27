import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import { useAuth } from "../Context/AuthContext";
import axios from "../axios";
import CheckoutPopup from "./CheckoutPopup";
import RazorpayPayment from "./RazorpayPayment";
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from "../utils/toast";

const Cart = () => {
  const { cart, removeFromCart, clearCart, updateCartItemQuantity } = useContext(AppContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartImage, setCartImage] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      try {
        const response = await axios.get("/products");
        const backendProductIds = response.data.map((product) => product.id);

        const updatedCartItems = cart.filter((item) => backendProductIds.includes(item.id));
        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            try {
              const response = await axios.get(
                `/product/${item.id}/image`,
                { responseType: "blob" }
              );
              const imageFile = await converUrlToFile(response.data, response.data.imageName);
              setCartImage(imageFile)
              const imageUrl = URL.createObjectURL(response.data);
              return { ...item, imageUrl };
            } catch (error) {
              return { ...item, imageUrl: "https://via.placeholder.com/300x200?text=No+Image" };
            }
          })
        );
        setCartItems(cartItemsWithImages);
      } catch (error) {
        // Handle error silently
      }
    };

    if (cart.length) {
      fetchImagesAndUpdateCart();
    }
  }, [cart]);

  const converUrlToFile = async(blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  }

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const handleIncreaseQuantity = (itemId) => {
    const currentItem = cartItems.find(item => item.id === itemId);
    if (!currentItem) return;

    const result = updateCartItemQuantity(itemId, currentItem.quantity + 1);

    if (result.success) {
      // Update local state to reflect the change
      const newCartItems = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: currentItem.quantity + 1 } : item
      );
      setCartItems(newCartItems);

      // Show success message
      showToast(result.message, 'success');
    } else {
      // Show error message
      showToast(result.message, 'error');
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    const currentItem = cartItems.find(item => item.id === itemId);
    if (!currentItem) return;

    const newQuantity = Math.max(currentItem.quantity - 1, 1);
    const result = updateCartItemQuantity(itemId, newQuantity);

    if (result.success) {
      if (newQuantity === 0) {
        // Item was removed
        setCartItems(cartItems.filter(item => item.id !== itemId));
      } else {
        // Update quantity
        const newCartItems = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(newCartItems);
      }

      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const showToast = (message, type) => {
    if (type === 'success') {
      showSuccessToast(message);
    } else {
      showErrorToast(message);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newCartItems);
  };

  const handleCheckout = async (checkoutData) => {
    try {
      // Map cart items to match backend OrderItemRequest structure
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price // Backend expects 'unitPrice', not 'price'
      }));

      // Create order request matching backend OrderRequest DTO
      const orderRequest = {
        items: items, // Backend expects 'items', not 'orderItems'
        shippingAddress: checkoutData?.shippingAddress || user?.address || 'Default Address',
        phoneNumber: checkoutData?.phoneNumber || user?.phoneNumber || '',
        notes: checkoutData?.notes || '',
        paymentMethod: checkoutData?.method || 'COD',
        paymentId: checkoutData?.paymentId || null,
        paymentStatus: checkoutData?.paymentVerified ? 'COMPLETED' : 'PENDING',
        // Guest customer information (for non-authenticated users)
        guestCustomerName: user?.username || checkoutData?.name || 'Guest Customer',
        guestCustomerEmail: user?.email || checkoutData?.email || 'guest@example.com'
      };

      console.log('Placing order with data:', orderRequest);

      const response = await axios.post('/orders', orderRequest);

      if (response.data) {
        clearCart();
        setCartItems([]);
        setShowModal(false);
        setShowPayment(false);

        showSuccessToast('Order placed successfully!');

        navigate('/order-success', {
          state: {
            orderId: response.data.id,
            orderNumber: response.data.orderNumber,
            totalAmount: totalPrice
          }
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.message || error.message || "Checkout failed. Please try again.";
      showErrorToast(errorMessage, 5000);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // If it's a UPI payment, send transaction details to backend for verification
      if (paymentData.paymentMethod === 'UPI') {
        const upiPaymentData = {
          upiTransactionId: paymentData.upiTransactionId,
          amount: paymentData.amount || totalPrice,
          orderNumber: `ORDER_${Date.now()}`,
          timestamp: paymentData.timestamp
        };

        console.log('Sending UPI payment data to backend:', upiPaymentData);

        const response = await axios.post('/payment/upi-payment', upiPaymentData);

        if (response.data.status === 'success') {
          showSuccessToast('UPI payment recorded successfully!');

          // Proceed with order creation
          await handleCheckout({
            ...paymentData,
            paymentVerified: true,
            backendResponse: response.data
          });
        } else {
          showErrorToast('UPI payment verification failed');
        }
      } else {
        // Handle other payment methods (Razorpay, etc.)
        handleCheckout(paymentData);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error.response?.data?.error || 'Payment processing failed';
      showErrorToast(errorMessage, 5000);
    }
  };

  const handlePaymentFailure = (error) => {
    alert("Payment failed. Please try again.");
  };

  // Allow guest users to use cart

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="cart-header mb-4">
          <h1 className="text-center mb-2">
            <i className="bi bi-bag me-3"></i>
            Shopping Cart
          </h1>
          <p className="text-center text-muted">Review your items before checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart text-center py-5">
            <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: 'var(--text-muted)' }}></i>
            <h3 className="mt-3">Your cart is empty</h3>
            <p className="text-muted">Add some products to get started!</p>
            <Button onClick={() => navigate('/')} className="btn btn-primary mt-3">
              <i className="bi bi-shop me-2"></i>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card mb-3">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{ maxHeight: '100px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="col-md-4">
                      <h6 className="mb-1">{item.name}</h6>
                      <small className="text-muted">{item.brand}</small>
                      <br />
                      <small className="text-muted">{item.category}</small>
                      <br />
                      <small className={`${item.stockQuantity <= 5 ? 'text-warning' : 'text-success'}`}>
                        <i className="bi bi-box me-1"></i>
                        {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
                      </small>
                    </div>
                    <div className="col-md-2">
                      <strong>₹{item.price.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="col-md-2">
                      <div className="quantity-controls d-flex align-items-center">
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleDecreaseQuantity(item.id)}
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleIncreaseQuantity(item.id)}
                          disabled={item.quantity >= item.stockQuantity}
                          title={item.quantity >= item.stockQuantity ? 'Maximum stock reached' : 'Increase quantity'}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-md-1">
                      <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="col-md-1">
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary mt-4">
              <div className="row justify-content-end">
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">Order Summary</h5>
                      <div className="d-flex justify-content-between">
                        <span>Subtotal:</span>
                        <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total: ₹{totalPrice.toLocaleString('en-IN')}</strong>
                      </div>
                      <Button 
                        className="btn btn-primary w-100 mt-3"
                        onClick={() => setShowModal(true)}
                      >
                        <i className="bi bi-credit-card me-2"></i>
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <CheckoutPopup
          show={showModal}
          handleClose={() => setShowModal(false)}
          cartItems={cartItems}
          totalPrice={totalPrice}
          handleCheckout={handleCheckout}
          onPaymentSelect={() => {
            setShowModal(false);
            setShowPayment(true);
          }}
        />

        {showPayment && (
          <RazorpayPayment
            amount={totalPrice}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            orderData={{
              items: cartItems,
              total: totalPrice,
              customer: user
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;
