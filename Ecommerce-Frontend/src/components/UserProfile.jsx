import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const UserProfile = () => {
  const { user, isAdmin, isCustomer } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin() ? '/profile/admin' : '/profile/customer';
      const response = await axios.get(endpoint);
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const endpoint = isAdmin() ? '/profile/admin' : '/profile/customer';
      const response = await axios.put(endpoint, formData);
      setProfile(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await axios.post('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setError('');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-wrapper">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={fetchProfile}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="user-profile">
          {/* Header */}
          <div className="profile-header mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="h2 mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  {isAdmin() ? 'Admin Profile' : 'My Profile'}
                </h1>
                <p className="text-muted mb-0">Manage your account information</p>
              </div>
              <div className="col-auto">
                <div className="d-flex gap-2">
                  {!editing ? (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setEditing(true)}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button 
                        className="btn btn-success"
                        onClick={handleSaveProfile}
                      >
                        <i className="bi bi-check me-2"></i>
                        Save Changes
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditing(false);
                          setFormData(profile);
                        }}
                      >
                        <i className="bi bi-x me-2"></i>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success border-0 text-center" role="alert" style={{ borderRadius: '10px' }}>
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-danger border-0 text-center" role="alert" style={{ borderRadius: '10px' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <div className="row">
            {/* Profile Information */}
            <div className="col-md-8 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Profile Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile?.username || ''}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profile?.email || ''}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData?.firstName || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData?.lastName || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData?.phoneNumber || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        rows="2"
                        value={formData?.address || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </div>

                    {/* Customer specific fields */}
                    {isCustomer() && (
                      <>
                        <div className="col-12 mb-3">
                          <h6>Notification Preferences</h6>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="emailNotifications"
                              checked={formData?.emailNotifications || false}
                              onChange={handleInputChange}
                              disabled={!editing}
                            />
                            <label className="form-check-label">
                              Email Notifications
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="smsNotifications"
                              checked={formData?.smsNotifications || false}
                              onChange={handleInputChange}
                              disabled={!editing}
                            />
                            <label className="form-check-label">
                              SMS Notifications
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Admin specific fields */}
                    {isAdmin() && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Department</label>
                          <input
                            type="text"
                            className="form-control"
                            name="department"
                            value={formData?.department || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Login Count</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profile?.loginCount || 0}
                            disabled
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-gear me-2"></i>
                    Account Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-outline-warning"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      <i className="bi bi-key me-2"></i>
                      Change Password
                    </button>
                    
                    {isCustomer() && (
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => navigate('/orders')}
                      >
                        <i className="bi bi-bag me-2"></i>
                        View Orders
                      </button>
                    )}
                    
                    {isAdmin() && (
                      <button 
                        className="btn btn-outline-success"
                        onClick={() => navigate('/admin/dashboard')}
                      >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Admin Dashboard
                      </button>
                    )}
                  </div>

                  {/* Password Change Form */}
                  {showPasswordForm && (
                    <div className="mt-4 pt-3 border-top">
                      <h6>Change Password</h6>
                      <div className="mb-3">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-warning"
                          onClick={handleChangePassword}
                        >
                          Update Password
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
