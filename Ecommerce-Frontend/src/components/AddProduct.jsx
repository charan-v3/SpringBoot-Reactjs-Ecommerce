import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import axios from "../axios";
import { handleProductError, logError } from "../utils/errorHandler";
import { showDetailedErrorToast, showSuccessToast } from "../utils/toast";

const AddProduct = () => {
  const { user, getToken } = useAuth();
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!image) {
      setError("Please select an image file");
      setLoading(false);
      return;
    }

    if (!product.name || !product.brand || !product.description || !product.price || !product.category) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setError("You must be logged in as an admin to add products");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("imageFile", image);
      formData.append(
        "product",
        new Blob([JSON.stringify(product)], { type: "application/json" })
      );

      const response = await axios.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });

      setSuccess("Product added successfully!");
      setError("");
      showSuccessToast("Product added successfully!");

      // Reset form after showing success message
      setTimeout(() => {
        setProduct({
          name: "",
          brand: "",
          description: "",
          price: "",
          category: "",
          stockQuantity: "",
          releaseDate: "",
          productAvailable: false,
        });
        setImage(null);
        setSuccess("");
      }, 2000);
      
    } catch (error) {
      logError(error, 'AddProduct');

      const errorMessage = handleProductError(error, 'add');
      setError(errorMessage);

      // Show detailed error toast
      showDetailedErrorToast({
        message: errorMessage,
        details: error.response?.data || error.message,
        status: error.response?.status
      }, 'Add Product');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            <div className="card shadow-lg border-0" style={{ 
              borderRadius: '20px', 
              width: '100%', 
              minWidth: '500px',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.98)'
            }}>
              <div className="card-header text-center" style={{ 
                borderRadius: '20px 20px 0 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '1.5rem'
              }}>
                <h2 className="mb-0 text-white">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Product
                </h2>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger border-0 text-center" role="alert" style={{ borderRadius: '10px' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success border-0 text-center" role="alert" style={{ borderRadius: '10px' }}>
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </div>
                )}
                
                <form onSubmit={submitHandler}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-tag me-2"></i>Product Name
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg border-0 shadow-sm"
                          placeholder="Enter product name"
                          onChange={handleInputChange}
                          value={product.name}
                          name="name"
                          style={{ 
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px'
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-award me-2"></i>Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          className="form-control form-control-lg border-0 shadow-sm"
                          placeholder="Enter brand name"
                          value={product.brand}
                          onChange={handleInputChange}
                          style={{ 
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px'
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">
                      <i className="bi bi-card-text me-2"></i>Description
                    </label>
                    <textarea
                      className="form-control form-control-lg border-0 shadow-sm"
                      placeholder="Enter product description"
                      value={product.description}
                      name="description"
                      onChange={handleInputChange}
                      rows="3"
                      style={{ 
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px',
                        resize: 'vertical'
                      }}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-currency-dollar me-2"></i>Price
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-lg border-0 shadow-sm"
                          placeholder="Enter price (e.g., 1000)"
                          onChange={handleInputChange}
                          value={product.price}
                          name="price"
                          style={{ 
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px'
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-grid me-2"></i>Category
                        </label>
                        <select
                          className="form-select form-select-lg border-0 shadow-sm"
                          value={product.category}
                          onChange={handleInputChange}
                          name="category"
                          style={{ 
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px'
                          }}
                          required
                        >
                          <option value="">Select category</option>
                          <option value="Laptop">Laptop</option>
                          <option value="Headphone">Headphone</option>
                          <option value="Mobile">Mobile</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Toys">Toys</option>
                          <option value="Fashion">Fashion</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-box me-2"></i>Stock Quantity
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-lg border-0 shadow-sm"
                          placeholder="Enter stock quantity"
                          onChange={handleInputChange}
                          value={product.stockQuantity}
                          name="stockQuantity"
                          style={{ 
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px'
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="bi bi-calendar me-2"></i>Release Date
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-lg border-0 shadow-sm"
                          value={product.releaseDate}
                          name="releaseDate"
                          onChange={handleInputChange}
                          style={{ 
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px'
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">
                      <i className="bi bi-image me-2"></i>Product Image
                    </label>
                    <input
                      className="form-control form-control-lg border-0 shadow-sm"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ 
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px'
                      }}
                      required
                    />
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Please select an image file (JPG, PNG, GIF)
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="productAvailable"
                        id="gridCheck"
                        checked={product.productAvailable}
                        onChange={(e) =>
                          setProduct({ ...product, productAvailable: e.target.checked })
                        }
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <label className="form-check-label fw-semibold text-dark ms-2">
                        <i className="bi bi-check-circle me-2"></i>Product Available
                      </label>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5"
                      disabled={loading}
                      style={{
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        padding: '12px 40px',
                        fontSize: '1.1rem'
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Adding Product...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Add Product
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
