import axios from "../axios";
import { useState, useEffect, createContext } from "react";
import analyticsTracker from "../utils/analyticsTracker";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData: () => {},
  updateStockQuantity: (productId, newQuantity) => {}
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);

  const addToCart = (product) => {
    // Check if product is available and has stock
    if (!product.productAvailable || product.stockQuantity <= 0) {
      return {
        success: false,
        message: "Product is out of stock"
      };
    }

    const existingProductIndex = cart.findIndex((item) => item.id === product.id);

    if (existingProductIndex !== -1) {
      const existingItem = cart[existingProductIndex];
      const newQuantity = existingItem.quantity + 1;

      // Check if new quantity exceeds available stock
      if (newQuantity > product.stockQuantity) {
        return {
          success: false,
          message: `Only ${product.stockQuantity} items available in stock. You already have ${existingItem.quantity} in cart.`
        };
      }

      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Track add to cart activity
      analyticsTracker.trackAddToCart(product.id, 1);

      return {
        success: true,
        message: `Added to cart. Total: ${newQuantity} items`
      };
    } else {
      // Adding new product to cart
      if (product.stockQuantity < 1) {
        return {
          success: false,
          message: "Product is out of stock"
        };
      }

      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Track add to cart activity for new product
      analyticsTracker.trackAddToCart(product.id, 1);

      return {
        success: true,
        message: "Product added to cart"
      };
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return {
        success: true,
        message: "Item removed from cart"
      };
    }

    // Find the product in the main data to check stock
    const product = data?.find(p => p.id === productId);
    if (!product) {
      return {
        success: false,
        message: "Product not found"
      };
    }

    // Check stock availability
    if (newQuantity > product.stockQuantity) {
      return {
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`
      };
    }

    const updatedCart = cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    return {
      success: true,
      message: `Quantity updated to ${newQuantity}`
    };
  };

  const refreshData = async () => {
    try {
      const response = await axios.get("/products");
      setData(response.data || []);
      setIsError("");
    } catch (error) {
      console.error("RefreshData Error Details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      let errorMessage = "Failed to load products";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            errorMessage = `Bad Request: ${data?.message || 'Invalid request'}`;
            break;
          case 401:
            errorMessage = "Authentication required to view products";
            break;
          case 403:
            errorMessage = "Access denied to product data";
            break;
          case 404:
            errorMessage = "Products endpoint not found";
            break;
          case 500:
            errorMessage = `Server Error: ${data?.message || 'Internal server error'}`;
            break;
          default:
            errorMessage = `HTTP ${status}: ${data?.message || error.message}`;
        }
      } else if (error.request) {
        errorMessage = "Network error: Unable to connect to server";
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      setIsError(errorMessage);
      setData([]);
    }
  };

  const clearCart = () => {
    setCart([]);
  }

  const updateStockQuantity = (productId, newQuantity) => {
    setData(prevData =>
      prevData.map(product =>
        product.id === productId
          ? { ...product, stockQuantity: newQuantity }
          : product
      )
    );
  };
  
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  return (
    <AppContext.Provider value={{
      data,
      isError,
      cart,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      refreshData,
      clearCart,
      updateStockQuantity
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;