import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import axios from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { showSuccessToast, showDetailedErrorToast } from "../utils/toast";
import { handleCartError, logError } from "../utils/errorHandler";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!isDataFetched) {
        setIsLoading(true);
        try {
          await refreshData();

          // Fallback: Direct fetch if context data is still null
          if (!data) {
            const response = await axios.get("/products");
            setProducts(response.data || []);
          }
        } catch (error) {
          console.error('Error loading data:', error);
          // Try direct fetch as last resort
          try {
            const response = await axios.get("/products");
            setProducts(response.data || []);
          } catch (fallbackError) {
            console.error('Fallback fetch failed:', fallbackError);
          }
        } finally {
          setIsDataFetched(true);
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [refreshData, isDataFetched, data]);

  useEffect(() => {
    if (data !== null || isError) {
      setIsLoading(false);
    }
  }, [data, isError]);

  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      const fetchImagesAndUpdateProducts = async () => {
        const updatedProducts = await Promise.all(
          data.map(async (product) => {
            try {
              const response = await axios.get(
                `/product/${product.id}/image`,
                { responseType: "blob" }
              );
              const imageUrl = URL.createObjectURL(response.data);
              return { ...product, imageUrl };
            } catch (error) {
              return { ...product, imageUrl: "https://via.placeholder.com/300x200?text=No+Image" };
            }
          })
        );
        setProducts(updatedProducts);
      };

      fetchImagesAndUpdateProducts();
    } else if (data && Array.isArray(data)) {
      // If data is empty array, set products to empty array
      setProducts([]);
    }
  }, [data]);

  // Ensure we have valid data to work with
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = selectedCategory
    ? safeProducts.filter((product) => product.category === selectedCategory)
    : safeProducts;

  const handleAddToCart = (product) => {
    try {
      // Since we removed authentication restrictions, allow guest cart usage
      const result = addToCart(product);

      if (result.success) {
        showSuccessToast(result.message);
      } else {
        showDetailedErrorToast({
          message: result.message,
          details: `Product: ${product.name}, Stock: ${product.stockQuantity}`
        }, 'Add to Cart');
      }
    } catch (error) {
      logError(error, 'Home - Add to Cart');
      const errorMessage = handleCartError(error, 'add item to cart');
      showDetailedErrorToast({
        message: errorMessage,
        details: error.message
      }, 'Add to Cart');
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="error-container">
            <img src={unplugged} alt="Error" style={{ width: '100px', height: '100px' }}/>
            <h2 className="mt-3">Oops! Something went wrong</h2>
            <p className="text-muted">We're having trouble loading the products. Please try again later.</p>
            <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Component render logic

  // Emergency fallback - always show something
  if (!isLoading && !isError && filteredProducts.length === 0 && !data) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="alert alert-info text-center">
            <h3>Welcome to Our Store!</h3>
            <p>Loading products... If this persists, please refresh the page.</p>
            <div className="mt-3">
              <button
                className="btn btn-primary me-2"
                onClick={() => {
                  setIsLoading(true);
                  setIsDataFetched(false);
                  refreshData().finally(() => setIsLoading(false));
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Retry Loading
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Page
              </button>
            </div>
            {user && (
              <div className="mt-3">
                <small className="text-muted">
                  Logged in as: {user.username} ({user.role})
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Ensure we always render something
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="hero-section mb-4">
          <h1 className="text-center mb-2">Discover Amazing Products</h1>
          <p className="text-center text-muted mb-4">Find everything you need in our curated collection</p>
        </div>
        <div className="grid">
        {!filteredProducts || filteredProducts.length === 0 ? (
          <div className="text-center w-100" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
            <div className="alert alert-info">
              <h3>No Products Available</h3>
              <p className="text-muted mb-3">
                {isError ? 'There was an error loading products.' : 'Check back later for new products!'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsLoading(true);
                  refreshData().finally(() => setIsLoading(false));
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Products
              </button>
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const { id, brand, name, price, productAvailable, stockQuantity, imageUrl } = product;
            return (
              <div
                className="card mb-3"
                style={{
                  width: "250px",
                  height: "360px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: (productAvailable && stockQuantity > 0) ? "#fff" : "#f5f5f5",
                  display: "flex",
                  flexDirection: "column"
                }}
                key={id}
              >
                <Link
                  to={`/product/${id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      padding: "5px",
                      borderRadius: "10px"
                    }}
                  />
                  <div
                    className="card-body"
                    style={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "10px",
                    }}
                  >
                    <div>
                      <h5 className="card-title" style={{ margin: "0 0 10px 0", fontSize: "1.2rem" }}>
                        {name.toUpperCase()}
                      </h5>
                      <i className="card-brand" style={{ fontStyle: "italic", fontSize: "0.8rem" }}>
                        ~ {brand}
                      </i>
                    </div>
                    <hr className="hr-line" style={{ margin: "10px 0" }} />
                    <div className="home-cart-price">
                      <h5 className="card-text" style={{ fontWeight: "600", fontSize: "1.1rem", marginBottom: '5px' }}>
                        ₹{price.toLocaleString('en-IN')}
                      </h5>
                    </div>
                    <button
                      className="btn-hover color-9"
                      style={{
                        margin: '10px 25px 0px',
                        backgroundColor: (productAvailable && stockQuantity > 0) ? '' : '#6c757d',
                        cursor: (productAvailable && stockQuantity > 0) ? 'pointer' : 'not-allowed'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (productAvailable && stockQuantity > 0) {
                          handleAddToCart(product);
                        }
                      }}
                      disabled={!productAvailable || stockQuantity === 0}
                    >
                      {(productAvailable && stockQuantity > 0) ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </Link>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};

export default Home;
