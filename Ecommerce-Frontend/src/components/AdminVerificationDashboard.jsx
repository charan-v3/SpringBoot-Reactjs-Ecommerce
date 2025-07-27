import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const AdminVerificationDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [verifiedAdmins, setVerifiedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/unauthorized');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingResponse, verifiedResponse] = await Promise.all([
        axios.get('/admin/verification/pending'),
        axios.get('/admin/verification/verified')
      ]);
      
      setPendingAdmins(pendingResponse.data);
      setVerifiedAdmins(verifiedResponse.data);
    } catch (error) {
      setError('Failed to load admin verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adminId) => {
    try {
      await axios.post(`/admin/verification/approve/${adminId}`);
      setSuccess('Admin approved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving admin:', error);
      setError('Failed to approve admin');
    }
  };

  const handleReject = async (adminId) => {
    if (window.confirm('Are you sure you want to reject this admin request? This action cannot be undone.')) {
      try {
        await axios.delete(`/admin/verification/reject/${adminId}`);
        setSuccess('Admin request rejected successfully!');
        setTimeout(() => setSuccess(''), 3000);
        fetchData(); // Refresh data
      } catch (error) {
        setError('Failed to reject admin');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-wrapper text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading admin verification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="admin-verification-dashboard">
          {/* Header */}
          <div className="dashboard-header mb-4">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="h2 mb-0">
                  <i className="bi bi-shield-check me-2"></i>
                  Admin Verification Dashboard
                </h1>
                <p className="text-muted mb-0">Manage admin registration requests</p>
              </div>
              <div className="col-auto">
                <button 
                  className="btn btn-outline-primary"
                  onClick={fetchData}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
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

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Pending Requests</h6>
                      <h3 className="mb-0">{pendingAdmins.length}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-clock-history fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Verified Admins</h6>
                      <h3 className="mb-0">{verifiedAdmins.length}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-shield-check fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Total Requests</h6>
                      <h3 className="mb-0">{pendingAdmins.length + verifiedAdmins.length}</h3>
                    </div>
                    <div className="align-self-center">
                      <i className="bi bi-people fs-1"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                  >
                    <i className="bi bi-clock-history me-2"></i>
                    Pending Requests ({pendingAdmins.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'verified' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verified')}
                  >
                    <i className="bi bi-shield-check me-2"></i>
                    Verified Admins ({verifiedAdmins.length})
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="card-body">
              {activeTab === 'pending' && (
                <div className="pending-requests">
                  {pendingAdmins.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox" style={{ fontSize: '4rem', color: 'var(--bs-secondary)' }}></i>
                      <h4 className="mt-3">No Pending Requests</h4>
                      <p className="text-muted">All admin requests have been processed.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {pendingAdmins.map((admin) => (
                        <div key={admin.id} className="col-md-6 mb-4">
                          <div className="card border-warning">
                            <div className="card-header bg-warning text-white">
                              <h6 className="mb-0">
                                <i className="bi bi-person-plus me-2"></i>
                                Admin Request
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="row">
                                <div className="col-6">
                                  <strong>Name:</strong><br />
                                  {admin.firstName} {admin.lastName}
                                </div>
                                <div className="col-6">
                                  <strong>Username:</strong><br />
                                  {admin.username}
                                </div>
                              </div>
                              <hr />
                              <div className="row">
                                <div className="col-6">
                                  <strong>Email:</strong><br />
                                  {admin.email}
                                </div>
                                <div className="col-6">
                                  <strong>Phone:</strong><br />
                                  {admin.phoneNumber || 'N/A'}
                                </div>
                              </div>
                              <hr />
                              <div className="mb-3">
                                <strong>UPI ID:</strong><br />
                                {admin.upiId || 'N/A'}
                              </div>
                              <div className="mb-3">
                                <strong>Reason:</strong><br />
                                {admin.requestReason || 'N/A'}
                              </div>
                              <div className="mb-3">
                                <strong>Experience:</strong><br />
                                {admin.experience || 'N/A'}
                              </div>
                              <div className="mb-3">
                                <strong>Requested:</strong><br />
                                {new Date(admin.requestedAt).toLocaleDateString()}
                              </div>
                              
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-success flex-fill"
                                  onClick={() => handleApprove(admin.id)}
                                >
                                  <i className="bi bi-check-circle me-2"></i>
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-danger flex-fill"
                                  onClick={() => handleReject(admin.id)}
                                >
                                  <i className="bi bi-x-circle me-2"></i>
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'verified' && (
                <div className="verified-admins">
                  {verifiedAdmins.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-shield-check" style={{ fontSize: '4rem', color: 'var(--bs-success)' }}></i>
                      <h4 className="mt-3">No Verified Admins</h4>
                      <p className="text-muted">No admins have been verified yet.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>UPI ID</th>
                            <th>Verified Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verifiedAdmins.map((admin) => (
                            <tr key={admin.id}>
                              <td>{admin.firstName} {admin.lastName}</td>
                              <td>{admin.username}</td>
                              <td>{admin.email}</td>
                              <td>{admin.upiId || 'N/A'}</td>
                              <td>{new Date(admin.verifiedAt).toLocaleDateString()}</td>
                              <td>
                                <span className="badge bg-success">
                                  <i className="bi bi-shield-check me-1"></i>
                                  Verified
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVerificationDashboard;
