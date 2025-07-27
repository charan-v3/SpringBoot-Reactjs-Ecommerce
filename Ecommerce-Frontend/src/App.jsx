import "./App.css";
import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import Login from "./components/Login";
import Signup from "./components/Signup";
import OrderHistory from "./components/OrderHistory";
import OrderTracking from "./components/OrderTracking";
import OrderSuccess from "./components/OrderSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./Context/Context";
import { AuthProvider } from "./Context/AuthContext";
import UpdateProduct from "./components/UpdateProduct";
import AdminDashboard from "./components/AdminDashboard";
import UserProfile from "./components/UserProfile";
import AdminVerificationDashboard from "./components/AdminVerificationDashboard";
import CustomerAnalytics from "./components/CustomerAnalytics";
import OrderManagement from "./components/OrderManagement";
import TestOrderManagement from "./components/TestOrderManagement";
import OrderDetail from "./components/OrderDetail";
import RoleRedirect from "./components/RoleRedirect";
import ErrorBoundary from "./components/ErrorBoundary";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
  };
  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Navbar onSelectCategory={handleCategorySelect} />
            <Routes>
            {/* Public Routes */}
            <Route path="/customer/login" element={<Login userType="customer" />} />
            <Route path="/admin/login" element={<Login userType="admin" />} />
            <Route path="/customer/signup" element={<Signup userType="customer" />} />
            <Route path="/admin/signup" element={<Signup userType="admin" />} />

            {/* Home Route - Public but cart requires login */}
            <Route
              path="/"
              element={<Home addToCart={addToCart} selectedCategory={selectedCategory} />}
            />

            {/* Product viewing - Public */}
            <Route path="/product" element={<Product />} />
            <Route path="/product/:id" element={<Product />} />

            {/* Public Routes - Core ecommerce functionality */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/track-order" element={<OrderTracking />} />

            {/* Orders Route - Role-based handling */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute requireAuth={true}>
                  <RoleRedirect showAdminInfo={true}>
                    <ProtectedRoute requireCustomer={true}>
                      <OrderHistory />
                    </ProtectedRoute>
                  </RoleRedirect>
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/add_product"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/update/:id"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UpdateProduct />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard Route */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* User Profile Routes - Optional login */}
            <Route path="/profile" element={<UserProfile />} />

            {/* Admin Verification Dashboard */}
            <Route
              path="/admin/verification"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminVerificationDashboard />
                </ProtectedRoute>
              }
            />

            {/* Customer Analytics */}
            <Route
              path="/admin/customer-analytics"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <CustomerAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Admin Order Management */}
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <OrderManagement />
                </ProtectedRoute>
              }
            />

            {/* Order Detail - Admin */}
            <Route
              path="/admin/order/:orderId"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Order Detail - Customer */}
            <Route
              path="/order/:orderId"
              element={
                <ProtectedRoute requireCustomer={true}>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Individual Customer Analytics */}
            <Route
              path="/analytics/customer/:customerId"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <CustomerAnalytics />
                </ProtectedRoute>
              }
            />



            {/* Unauthorized Route */}
            <Route
              path="/unauthorized"
              element={
                <div className="page-container">
                  <div className="content-wrapper text-center">
                    <h2>Unauthorized Access</h2>
                    <p>You don't have permission to access this page.</p>
                    <a href="/" className="btn btn-primary">Go Home</a>
                  </div>
                </div>
              }
            />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
          <ScrollToTop />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
