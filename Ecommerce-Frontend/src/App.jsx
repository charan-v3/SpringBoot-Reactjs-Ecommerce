import "./App.css";
import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./Context/Context";
import { AuthProvider } from "./Context/AuthContext";
import UpdateProduct from "./components/UpdateProduct";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap/dist/css/bootstrap.min.css';


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

            {/* Protected Routes - Require Authentication */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
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
                  <div className="container mt-4">
                    <div className="row">
                      <div className="col-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">
                            <i className="bi bi-shield-check me-2"></i>
                            Admin Dashboard
                          </h4>
                          <p>Welcome to the admin dashboard! You have full access to manage products and view all system features.</p>
                          <hr />
                          <div className="d-flex gap-3">
                            <a href="/add_product" className="btn btn-primary">
                              <i className="bi bi-plus-circle me-2"></i>Add New Product
                            </a>
                            <a href="/" className="btn btn-outline-primary">
                              <i className="bi bi-grid me-2"></i>View All Products
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Home addToCart={addToCart} selectedCategory={selectedCategory} />
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Unauthorized Route */}
            <Route
              path="/unauthorized"
              element={
                <div className="container mt-5 text-center">
                  <h2>Unauthorized Access</h2>
                  <p>You don't have permission to access this page.</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              }
            />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
