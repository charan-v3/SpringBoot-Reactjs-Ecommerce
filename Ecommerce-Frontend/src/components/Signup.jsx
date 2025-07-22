import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Signup = ({ userType = 'customer' }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const endpoint = userType === 'admin' 
        ? 'http://localhost:8080/api/auth/admin/signup'
        : 'http://localhost:8080/api/auth/customer/signup';

      const response = await axios.post(endpoint, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      
      if (response.data.message) {
        alert('Registration successful! Please login.');
        navigate(userType === 'admin' ? '/admin/login' : '/customer/login');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center min-vh-100" style={{
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            <div className="card auth-card shadow-lg border-0" style={{ borderRadius: '20px', width: '100%', minWidth: '500px' }}>
              <div className="card-body" style={{ padding: '2.5rem' }}>
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className={`bi ${userType === 'admin' ? 'bi-shield-plus' : 'bi-person-plus-fill'} auth-icon text-primary pulse-animation`}
                       style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">
                    {userType === 'admin' ? 'Create Admin Account' : 'Join Our Community'}
                  </h2>
                  <p className="text-muted mb-0">
                    {userType === 'admin' ? 'Register as an administrator' : 'Create your customer account to get started'}
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger border-0 text-center" role="alert" style={{ borderRadius: '10px' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="firstName" className="form-label fw-semibold text-dark">
                          <i className="bi bi-person me-2"></i>First Name
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg auth-input border-0 shadow-sm"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
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
                        <label htmlFor="lastName" className="form-label fw-semibold text-dark">
                          <i className="bi bi-person me-2"></i>Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg auth-input border-0 shadow-sm"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
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
                    <label htmlFor="username" className="form-label fw-semibold text-dark">
                      <i className="bi bi-at me-2"></i>Username
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg auth-input border-0 shadow-sm"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      style={{
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px'
                      }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      <i className="bi bi-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg auth-input border-0 shadow-sm"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      style={{
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px'
                      }}
                      required
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-semibold text-dark">
                          <i className="bi bi-lock me-2"></i>Password
                        </label>
                        <input
                          type="password"
                          className="form-control form-control-lg auth-input border-0 shadow-sm"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create password"
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
                        <label htmlFor="confirmPassword" className="form-label fw-semibold text-dark">
                          <i className="bi bi-lock-fill me-2"></i>Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control form-control-lg auth-input border-0 shadow-sm"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
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
                    <label htmlFor="phoneNumber" className="form-label fw-semibold text-dark">
                      <i className="bi bi-telephone me-2"></i>Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-lg auth-input border-0 shadow-sm"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter phone number (optional)"
                      style={{
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="address" className="form-label fw-semibold text-dark">
                      <i className="bi bi-geo-alt me-2"></i>Address
                    </label>
                    <textarea
                      className="form-control form-control-lg auth-input border-0 shadow-sm"
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address (optional)"
                      style={{
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px',
                        resize: 'vertical'
                      }}
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 fw-semibold auth-btn mb-4"
                    disabled={loading}
                    style={{
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      padding: '12px'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <hr className="my-4" />

                  <p className="text-muted mb-3">Already have an account?</p>
                  <Link
                    to={userType === 'admin' ? '/admin/login' : '/customer/login'}
                    className="btn btn-outline-primary w-100 fw-semibold mb-3"
                    style={{
                      borderRadius: '10px',
                      padding: '10px',
                      borderWidth: '2px'
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login as {userType === 'admin' ? 'Admin' : 'Customer'}
                  </Link>

                  <Link
                    to={userType === 'admin' ? '/customer/signup' : '/admin/signup'}
                    className="btn btn-link text-decoration-none"
                    style={{ color: '#667eea' }}
                  >
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Register as {userType === 'admin' ? 'Customer' : 'Admin'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
