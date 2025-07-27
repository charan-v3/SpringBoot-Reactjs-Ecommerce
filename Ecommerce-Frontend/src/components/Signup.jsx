import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import './Auth.css';
import ErrorDisplay from './ErrorDisplay';

const Signup = ({ userType = 'customer' }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    // Admin specific fields
    upiId: '',
    requestReason: '',
    experience: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        return value.trim().length < 3 ? 'Username must be at least 3 characters' : '';
      case 'email':
        return !value.includes('@') ? 'Please enter a valid email' : '';
      case 'password':
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      case 'confirmPassword':
        return value !== formData.password ? 'Passwords do not match' : '';
      case 'firstName':
        return value.trim().length < 2 ? 'First name must be at least 2 characters' : '';
      case 'lastName':
        return value.trim().length < 2 ? 'Last name must be at least 2 characters' : '';
      case 'upiId':
        if (userType === 'admin') {
          if (!value.trim()) return 'UPI ID is required';
          if (!value.match(/^[0-9]{10}@[a-zA-Z]+$/)) return 'Format: 9976656631@axl';
        }
        return '';
      case 'requestReason':
        if (userType === 'admin') {
          return value.trim().length < 20 ? 'Please provide at least 20 characters' : '';
        }
        return '';
      case 'experience':
        if (userType === 'admin') {
          return value.trim().length < 20 ? 'Please provide at least 20 characters' : '';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time field validation
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Clear general error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.username || formData.username.trim().length < 3) {
      return 'Username must be at least 3 characters long';
    }

    if (!formData.email || !formData.email.includes('@')) {
      return 'Please provide a valid email address';
    }

    if (!formData.password || formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!formData.firstName || formData.firstName.trim().length < 2) {
      return 'First name must be at least 2 characters long';
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
      return 'Last name must be at least 2 characters long';
    }

    // Admin-specific validation
    if (userType === 'admin') {
      if (!formData.upiId || formData.upiId.trim().length === 0) {
        return 'UPI ID is required for admin registration';
      }

      if (!formData.upiId.match(/^[0-9]{10}@[a-zA-Z]+$/)) {
        return 'UPI ID must be in format: 9976656631@axl';
      }

      if (!formData.requestReason || formData.requestReason.trim().length < 20) {
        return 'Please provide a detailed reason (at least 20 characters) for why you want to become an admin';
      }

      if (!formData.experience || formData.experience.trim().length < 20) {
        return 'Please provide detailed information about your experience (at least 20 characters)';
      }
    }

    return null; // No validation errors
  };

  const getFieldClass = (fieldName) => {
    const baseClass = "form-control form-control-lg auth-input border-0 shadow-sm";
    const hasError = fieldErrors[fieldName];
    const hasValue = formData[fieldName] && formData[fieldName].trim().length > 0;

    if (hasError) {
      return `${baseClass} is-invalid`;
    } else if (hasValue && !hasError) {
      return `${baseClass} is-valid`;
    }
    return baseClass;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = userType === 'admin'
        ? '/auth/admin/signup'
        : '/auth/customer/signup';

      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      };

      // Add admin-specific fields if signing up as admin
      if (userType === 'admin') {
        requestData.upiId = formData.upiId;
        requestData.requestReason = formData.requestReason;
        requestData.experience = formData.experience;
      }

      console.log('Signup attempt:', {
        userType,
        endpoint,
        baseURL: axios.defaults.baseURL,
        fullURL: `${axios.defaults.baseURL}${endpoint}`,
        requestData: { ...requestData, password: '[HIDDEN]' }
      });

      const response = await axios.post(endpoint, requestData);
      
      if (response.data.message) {
        if (userType === 'admin') {
          setSuccess('Admin registration submitted! Your request is pending approval from an existing admin. You will be notified once approved.');
          setTimeout(() => {
            navigate('/customer/login'); // Redirect to customer login page with a note
          }, 3000);
        } else {
          setSuccess('Registration successful! Redirecting to login...');
          setTimeout(() => {
            navigate('/customer/login');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });

      // Extract detailed error message
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.status === 404) {
        errorMessage = `Endpoint not found: ${error.config?.url}\n\nThis usually means:\n1. Backend server is not running on http://localhost:8080\n2. The API endpoint doesn't exist\n3. There's a routing issue\n\nPlease check:\n- Is the Spring Boot server running?\n- Are you accessing the correct URL?\n- Check browser console for more details`;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred. Please check the backend logs and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data) {
        // If the response data is a string
        errorMessage = typeof error.response.data === 'string'
          ? error.response.data
          : 'Registration failed. Please check your information and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add specific guidance for admin registration
      if (userType === 'admin') {
        if (errorMessage.includes('UPI ID')) {
          errorMessage += '\n\nTip: UPI ID should be in format like 9976656631@axl';
        } else if (errorMessage.includes('Username')) {
          errorMessage += '\n\nTip: Choose a unique username that hasn\'t been used before';
        } else if (errorMessage.includes('Email')) {
          errorMessage += '\n\nTip: Use a different email address that hasn\'t been registered';
        } else if (errorMessage.includes('reason') || errorMessage.includes('experience')) {
          errorMessage += '\n\nTip: Please provide detailed information about why you want to become an admin and your relevant experience';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            <div className="card auth-card shadow-lg border-0" style={{ borderRadius: '20px', width: '100%', minWidth: '500px' }}>
              <div className="card-body">
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

                <ErrorDisplay
                  error={error}
                  type="danger"
                  title="Registration Failed"
                  className="mb-3"
                />

                {success && (
                  <div className="alert alert-success border-0 text-center" role="alert" style={{ borderRadius: '10px' }}>
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
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
                          className={getFieldClass('firstName')}
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
                        {fieldErrors.firstName && (
                          <div className="invalid-feedback d-block">
                            <small>{fieldErrors.firstName}</small>
                          </div>
                        )}
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

                  {/* Admin-specific fields */}
                  {userType === 'admin' && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="upiId" className="form-label fw-semibold text-dark">
                          <i className="bi bi-credit-card me-2"></i>UPI ID / GPay Number
                        </label>
                        <input
                          type="text"
                          className={getFieldClass('upiId')}
                          id="upiId"
                          name="upiId"
                          value={formData.upiId}
                          onChange={handleChange}
                          placeholder="Enter your UPI ID (e.g., 9976656631@axl)"
                          style={{
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px'
                          }}
                          required
                        />
                        {fieldErrors.upiId && (
                          <div className="invalid-feedback d-block">
                            <small>{fieldErrors.upiId}</small>
                          </div>
                        )}
                        <small className="text-muted">This will be used for payment transfers when your products are sold</small>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="requestReason" className="form-label fw-semibold text-dark">
                          <i className="bi bi-question-circle me-2"></i>Why do you want to become an admin?
                        </label>
                        <textarea
                          className="form-control form-control-lg auth-input border-0 shadow-sm"
                          id="requestReason"
                          name="requestReason"
                          rows="3"
                          value={formData.requestReason}
                          onChange={handleChange}
                          placeholder="Explain why you want admin access..."
                          style={{
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px',
                            resize: 'vertical'
                          }}
                          required
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="experience" className="form-label fw-semibold text-dark">
                          <i className="bi bi-briefcase me-2"></i>Previous Experience
                        </label>
                        <textarea
                          className="form-control form-control-lg auth-input border-0 shadow-sm"
                          id="experience"
                          name="experience"
                          rows="3"
                          value={formData.experience}
                          onChange={handleChange}
                          placeholder="Describe your relevant experience..."
                          style={{
                            borderRadius: '10px',
                            backgroundColor: '#f8f9fa',
                            padding: '12px 16px',
                            resize: 'vertical'
                          }}
                          required
                        ></textarea>
                      </div>

                      <div className="alert alert-info border-0" style={{ borderRadius: '10px' }}>
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Note:</strong> Your admin request will need to be approved by an existing admin before you can access admin features.
                      </div>
                    </>
                  )}

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
