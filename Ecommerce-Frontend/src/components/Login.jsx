import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import axios from '../axios';
import './Auth.css';

const Login = ({ userType = 'customer' }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
    setSuccess('');

    try {
      const endpoint = userType === 'admin'
        ? '/auth/admin/login'
        : '/auth/customer/login';

      const response = await axios.post(endpoint, formData);

      if (response.data.token) {
        // Use AuthContext login method
        const userData = {
          token: response.data.token,
          username: response.data.username,
          email: response.data.email,
          role: response.data.role
        };

        login(userData);

        // Show success message
        setSuccess(`Welcome back, ${response.data.username}!`);

        // Immediate redirect
        if (response.data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          setError('Invalid username or password. Please check your credentials and try again.');
        } else if (error.response.status === 403) {
          setError('Access denied. Please check if you are using the correct login type.');
        } else {
          setError(error.response.data?.message || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        // Network error
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        // Other error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card auth-card shadow-lg border-0" style={{ borderRadius: '20px', width: '100%', minWidth: '400px' }}>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className={`bi ${userType === 'admin' ? 'bi-shield-check' : 'bi-person-circle'} auth-icon text-primary pulse-animation`}
                       style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">
                    {userType === 'admin' ? 'Admin Login' : 'Welcome Back'}
                  </h2>
                  <p className="text-muted mb-0">
                    {userType === 'admin' ? 'Access your admin dashboard' : 'Sign in to your account'}
                  </p>
                </div>

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

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-semibold text-dark">
                      <i className="bi bi-person me-2"></i>Username
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg auth-input border-0 shadow-sm"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      style={{
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px'
                      }}
                      required
                    />
                  </div>

                  <div className="mb-4">
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
                      placeholder="Enter your password"
                      style={{
                        borderRadius: '10px',
                        backgroundColor: '#f8f9fa',
                        padding: '12px 16px'
                      }}
                      required
                    />
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
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <hr className="my-4" />

                  <p className="text-muted mb-3">Don't have an account?</p>
                  <Link
                    to={userType === 'admin' ? '/admin/signup' : '/customer/signup'}
                    className="btn btn-outline-primary w-100 fw-semibold mb-3"
                    style={{
                      borderRadius: '10px',
                      padding: '10px',
                      borderWidth: '2px'
                    }}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Create {userType === 'admin' ? 'Admin' : 'Customer'} Account
                  </Link>

                  <Link
                    to={userType === 'admin' ? '/customer/login' : '/admin/login'}
                    className="btn btn-link text-decoration-none"
                    style={{ color: '#667eea' }}
                  >
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Switch to {userType === 'admin' ? 'Customer' : 'Admin'} Login
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

export default Login;
