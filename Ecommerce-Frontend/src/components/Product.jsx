import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useState } from "react";
import AppContext from "../Context/Context";
import { useAuth } from "../Context/AuthContext";
import axios from "../axios";
import UpdateProduct from "./UpdateProduct";
import { showSuccessToast, showDetailedErrorToast } from "../utils/toast";
import { handleCartError, handleProductError, logError } from "../utils/errorHandler";
const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, cart, refreshData } =
    useContext(AppContext);
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `/product/${id}`
        );
        setProduct(response.data);
        if (response.data.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchImage = async () => {
      const response = await axios.get(
        `/product/${id}/image`,
        { responseType: "blob" }
      );
      setImageUrl(URL.createObjectURL(response.data));
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    try {
      await axios.delete(`/product/${id}`);
      removeFromCart(id);
      console.log("Product deleted successfully");
      showSuccessToast("Product deleted successfully");
      refreshData();
      navigate("/");
    } catch (error) {
      logError(error, 'Product - Delete');
      const errorMessage = handleProductError(error, 'delete');
      showDetailedErrorToast({
        message: errorMessage,
        details: error.response?.data || error.message,
        status: error.response?.status
      }, 'Delete Product');
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handlAddToCart = () => {
    try {
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
      logError(error, 'Product - Add to Cart');
      const errorMessage = handleCartError(error, 'add item to cart');
      showDetailedErrorToast({
        message: errorMessage,
        details: error.message
      }, 'Add to Cart');
    }
  };
  if (!product) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="containers" style={{ display: "flex" }}>
        <img
          className="left-column-img"
          src={imageUrl}
          alt={product.imageName}
          style={{ width: "50%", height: "auto" }}
        />

        <div className="right-column" style={{ width: "50%" }}>
          <div className="product-description">
            <div style={{display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 'lighter' }}>
              {product.category}
            </span>
            <p className="release-date" style={{ marginBottom: "2rem" }}>
              
              <h6>Listed : <span> <i> {new Date(product.releaseDate).toLocaleDateString()}</i></span></h6>
              {/* <i> {new Date(product.releaseDate).toLocaleDateString()}</i> */}
            </p>
            </div>
            
           
            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem",textTransform: 'capitalize', letterSpacing:'1px' }}>
              {product.name}
            </h1>
            <i style={{ marginBottom: "3rem" }}>{product.brand}</i>
            <p style={{fontWeight:'bold',fontSize:'1rem',margin:'10px 0px 0px'}}>PRODUCT DESCRIPTION :</p>
            <p style={{ marginBottom: "1rem" }}>{product.description}</p>
          </div>

          <div className="product-price">
            <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <button
              className={`cart-btn ${
                !product.productAvailable || product.stockQuantity === 0 ? "disabled-btn" : ""
              }`}
              onClick={handlAddToCart}
              disabled={!product.productAvailable || product.stockQuantity === 0}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: product.productAvailable && product.stockQuantity > 0 ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: product.productAvailable && product.stockQuantity > 0 ? "pointer" : "not-allowed",
                marginBottom: "1rem",
              }}
            >
              {product.productAvailable && product.stockQuantity > 0 ? "Add to cart" : "Out of Stock"}
            </button>
            <h6 style={{ marginBottom: "1rem" }}>
              Stock Available :{" "}
              <i style={{ color: "green", fontWeight: "bold" }}>
                {product.stockQuantity}
              </i>
            </h6>
          
          </div>
          {/* Admin-only buttons */}
          {isAdmin() && (
            <div className="update-button" style={{ display: "flex", gap: "1rem" }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleEditClick}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Update
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={deleteProduct}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Product;