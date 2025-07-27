import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import axios from "../axios";

const Navbar = ({ onSelectCategory, onSearch }) => {
  const { isAuthenticated, isAdmin, isCustomer, logout, user } = useAuth();
  const navigate = useNavigate();

  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults,setShowSearchResults] = useState(false)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchData();

    // Add scroll listener for navbar effect
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async (value) => {
    try {
      const response = await axios.get("/products");
      setSearchResults(response.data);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleChange = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true)
    try {
      const response = await axios.get(
        `/products/search?keyword=${value}`
      );
      setSearchResults(response.data);
      setNoResults(response.data.length === 0);
      console.log(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  
  // const handleChange = async (value) => {
  //   setInput(value);
  //   if (value.length >= 1) {
  //     setShowSearchResults(true);
  //     try {
  //       let response;
  //       if (!isNaN(value)) {
  //         // Input is a number, search by ID
  //         response = await axios.get(`http://localhost:8080/api/products/search?id=${value}`);
  //       } else {
  //         // Input is not a number, search by keyword
  //         response = await axios.get(`http://localhost:8080/api/products/search?keyword=${value}`);
  //       }

  //       const results = response.data;
  //       setSearchResults(results);
  //       setNoResults(results.length === 0);
  //       console.log(results);
  //     } catch (error) {
  //       console.error("Error searching:", error.response ? error.response.data : error.message);
  //     }
  //   } else {
  //     setShowSearchResults(false);
  //     setSearchResults([]);
  //     setNoResults(false);
  //   }
  // };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = [
    "Laptop",
    "Headphone",
    "Mobile",
    "Electronics",
    "Toys",
    "Fashion",
  ];
  return (
    <>
      <header>
        <nav className={`navbar navbar-expand-lg fixed-top ${scrolled ? 'scrolled' : ''}`}>
          <div className="container-fluid">
            <a className="navbar-brand" href="/">
              <i className="bi bi-lightning-charge-fill me-2"></i>
              Ekart
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/">
                    Home
                  </Link>
                </li>
                {isAuthenticated() && isAdmin() && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/add_product">
                      Add Product
                    </Link>
                  </li>
                )}

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="/"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Categories
                  </a>

                  <ul className="dropdown-menu">
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>

                {isAuthenticated() && (
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      <i className="bi bi-bag-check me-1"></i>
                      Orders
                    </a>
                    <ul className="dropdown-menu">
                      {isCustomer() && (
                        <li><Link className="dropdown-item" to="/orders">
                          <i className="bi bi-clock-history me-2"></i>
                          My Order History
                        </Link></li>
                      )}
                      {isAdmin() && (
                        <li><Link className="dropdown-item" to="/admin/orders">
                          <i className="bi bi-gear me-2"></i>
                          Manage All Orders
                        </Link></li>
                      )}
                      <li><Link className="dropdown-item" to="/track-order">
                        <i className="bi bi-geo-alt me-2"></i>
                        Track Order
                      </Link></li>
                    </ul>
                  </li>
                )}
                <li className="nav-item"></li>
              </ul>
              <button className="theme-btn" onClick={() => toggleTheme()}>
                {theme === "dark-theme" ? (
                  <i className="bi bi-moon-fill"></i>
                ) : (
                  <i className="bi bi-sun-fill"></i>
                )}
              </button>

              <div className="d-flex align-items-center">
                {/* Authentication Links */}
                {!isAuthenticated() ? (
                  <div className="d-flex align-items-center me-3">
                    <Link to="/customer/login" className="btn btn-outline-primary me-2">
                      Login
                    </Link>
                    <div className="dropdown">
                      <button className="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Sign Up
                      </button>
                      <ul className="dropdown-menu">
                        <li><Link className="dropdown-item" to="/customer/signup">Customer</Link></li>
                        <li><Link className="dropdown-item" to="/admin/signup">Admin</Link></li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center me-3">
                    <div className="dropdown me-3">
                      <button
                        className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        <i className={`bi ${user?.role === 'ADMIN' ? 'bi-shield-check' : 'bi-person-circle'} me-2`}></i>
                        {user?.username}
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <Link className="dropdown-item" to="/profile">
                            <i className="bi bi-person me-2"></i>My Profile
                          </Link>
                        </li>
                        {isAdmin() && (
                          <>
                            <li>
                              <Link className="dropdown-item" to="/admin/dashboard">
                                <i className="bi bi-speedometer2 me-2"></i>Admin Dashboard
                              </Link>
                            </li>
                            <li>
                              <Link className="dropdown-item" to="/admin/orders">
                                <i className="bi bi-bag-check me-2"></i>Manage Orders
                              </Link>
                            </li>
                          </>
                        )}
                        {isCustomer() && (
                          <li>
                            <Link className="dropdown-item" to="/orders">
                              <i className="bi bi-bag me-2"></i>My Orders
                            </Link>
                          </li>
                        )}
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-2"></i>Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Enhanced Search */}
                <div className="search-container me-3">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    className="search-input"
                    type="search"
                    placeholder="Search products..."
                    aria-label="Search"
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  />
                  {showSearchResults && (
                    <ul className="list-group">
                      {searchResults.length > 0 ? (
                          searchResults.map((result) => (
                            <li key={result.id} className="list-group-item">
                              <Link
                                to={`/product/${result.id}`}
                                className="search-result-link d-flex align-items-center text-decoration-none"
                                onClick={() => {
                                  setInput('');
                                  setShowSearchResults(false);
                                }}
                              >
                                <i className="bi bi-box-seam me-2 text-muted"></i>
                                <div>
                                  <div className="fw-semibold">{result.name}</div>
                                  <small className="text-muted">{result.brand} • ${result.price}</small>
                                </div>
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li className="list-group-item">
                            <div className="text-center text-muted">
                              <i className="bi bi-search me-2"></i>
                              No products found
                            </div>
                          </li>
                        )}
                    </ul>
                  )}
                </div>

                {/* Enhanced Cart Link */}
                <div className="cart me-3">
                  <Link to="/cart" className="nav-link">
                    <i className="bi bi-cart3"></i>
                    Cart
                  </Link>
                </div>

                {/* <button
                  className="btn btn-outline-success"
                  onClick={handleSearch}
                >
                  Search Products
                </button> */}
                {/* </form> */}
                <div />
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
