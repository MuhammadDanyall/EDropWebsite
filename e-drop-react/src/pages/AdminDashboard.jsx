import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [cargoOrders, setCargoOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Admin Login Local States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [loginStep, setLoginStep] = useState('credentials'); // 'credentials', 'otp', 'forgot', 'reset'
  const [loginError, setLoginError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);

  // Reply System States
  const [replyingTo, setReplyingTo] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Edit User States
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ fullName: '', phone: '', role: '' });

  // Edit Shipment/Cargo States
  const [editingShipment, setEditingShipment] = useState(null);
  const [editingCargo, setEditingCargo] = useState(null);
  const [editShipmentFormData, setEditShipmentFormData] = useState({});
  const [editCargoFormData, setEditCargoFormData] = useState({});

  // Website Content States
  const [siteContent, setSiteContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutTitle: '',
    aboutDesc1: '',
    aboutDesc2: '',
    contactPhone: '',
    contactEmail: '',
    contactLocation: '',
    aboutPageStory: '',
    aboutPageMission: '',
    aboutPageVision: '',
    ecabHeroTitle: '',
    ecabDescription: '',
    shippingHeroTitle: '',
    shippingDescription: '',
    cargoHeroTitle: '',
    cargoDescription: '',
    faqGeneralTitle: '',
    faqSupportTitle: '',
    privacyPolicyContent: '',
    termsConditionsContent: '',
    facebookLink: '',
    twitterLink: '',
    instagramLink: '',
    linkedinLink: ''
  });
  const [selectedPage, setSelectedPage] = useState('home');
  const [isSavingContent, setIsSavingContent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let user = null;
        try {
          user = JSON.parse(sessionStorage.getItem('user'));
        } catch (e) {
          console.error("No user found in sessionStorage");
        }

        const API_BASE = API_BASE_URL;
        const config = {
          headers: {
            'user-role': user?.role || '',
            'user-id': user?.id || ''
          }
        };

        // Use allSettled so one failed API doesn't kill the whole dashboard
        const results = await Promise.allSettled([
          axios.get(`${API_BASE}/api/admin/users`, config),
          axios.get(`${API_BASE}/api/admin/messages`, config),
          axios.get(`${API_BASE}/api/content`),
          axios.get(`${API_BASE}/api/admin/shipments`, config),
          axios.get(`${API_BASE}/api/admin/cargo`, config)
        ]);

        if (results[0].status === 'fulfilled') setUsers(results[0].value.data);
        if (results[1].status === 'fulfilled') setMessages(results[1].value.data);
        if (results[2].status === 'fulfilled') setSiteContent(results[2].value.data);
        if (results[3].status === 'fulfilled') setShipments(results[3].value.data);
        if (results[4].status === 'fulfilled') setCargoOrders(results[4].value.data);

        // Alert user if there's an auth error in the main datasets
        const authFailed = results.some(r => r.status === 'rejected' && r.reason?.response?.status === 403);
        if (authFailed) {
          console.warn("Some data failed to load due to restricted access.");
        }

      } catch (error) {
        console.error('CRITICAL: Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkInitialAuth = () => {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (user && user.role === 'admin') {
        setIsAdmin(true);
        setAdminUser(user);
        fetchData();
      }
      setAuthChecking(false);
    };

    checkInitialAuth();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: adminEmail,
        password: adminPass
      });
      
      if (res.data.otpRequired) {
        setLoginStep('otp');
        setLoginError('');
      } else if (res.data.user.role === 'admin') {
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('token', res.data.token);
        setIsAdmin(true);
        window.location.reload(); 
      } else {
        setLoginError("Access Denied: You are not an admin.");
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed. Check credentials.");
    }
  };

  const handleAdminOtpVerify = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-admin-otp`, {
        email: adminEmail,
        otp: adminOtp
      });

      if (res.data.success) {
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        sessionStorage.setItem('token', res.data.token);
        setIsAdmin(true);
        window.location.reload();
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid or expired OTP.");
    }
  };

  const handleAdminForgotPassword = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email: adminEmail });
      alert(res.data.message);
      setLoginStep('reset');
    } catch (err) {
      setLoginError(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email: adminEmail,
        otp: adminOtp,
        newPassword: newAdminPass
      });
      alert(res.data.message);
      setLoginStep('credentials');
      setAdminOtp('');
      setNewAdminPass('');
    } catch (err) {
      setLoginError(err.response?.data?.message || "Reset failed. Check OTP.");
    }
  };

  // ... (previous handlers)

  const handleCargoStatusChange = async (cargoId, newStatus) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/cargo/${cargoId}/status`,
        { status: newStatus },
        { headers: { 'user-role': user?.role || 'admin', 'user-id': user?.id || '' } }
      );
      setCargoOrders(cargoOrders.map(c => c._id === cargoId ? res.data.cargo : c));
      alert("Cargo status updated successfully.");
    } catch (err) {
      console.error("Error updating cargo status:", err);
      alert("Failed to update status.");
    }
  };

  // Function to Handle Edit Click
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      role: user.role || 'customer'
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.put(`${API_BASE_URL}/api/admin/users/${editingUser._id}`, editFormData, {
        headers: { 'user-role': user?.role || '', 'user-id': user?.id || '' }
      });
      setUsers(users.map(u => u._id === editingUser._id ? res.data.user : u));
      setEditingUser(null);
      alert("User updated successfully.");
    } catch (error) {
      console.error('Error updating user:', error);
      alert("Failed to update user.");
    }
  };

  // Function to Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          'user-role': user?.role || '',
          'user-id': user?.id || ''
        }
      });
      setUsers(users.filter(u => u._id !== userId));
      alert("User deleted successfully.");
    } catch (error) {
      console.error('Error deleting user:', error);
      alert("Failed to delete user.");
    }
  };

  // Function to Edit Shipment
  const handleEditShipmentClick = (shipment) => {
    setEditingShipment(shipment);
    setEditShipmentFormData({ ...shipment });
  };

  const handleEditShipmentChange = (e) => {
    setEditShipmentFormData({ ...editShipmentFormData, [e.target.name]: e.target.value });
  };

  const handleEditShipmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/shipments/${editingShipment._id}`,
        editShipmentFormData,
        {
          headers: {
            'user-role': user?.role || '',
            'user-id': user?.id || ''
          }
        }
      );
      setShipments(shipments.map(s => s._id === editingShipment._id ? res.data.shipment : s));
      setEditingShipment(null);
      alert("Shipment updated successfully.");
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert("Failed to update shipment.");
    }
  };

  // Function to Delete Shipment
  const handleDeleteShipment = async (shipmentId) => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await axios.delete(`${API_BASE_URL}/api/admin/shipments/${shipmentId}`, {
        headers: {
          'user-role': user?.role || '',
          'user-id': user?.id || ''
        }
      });
      setShipments(shipments.filter(s => s._id !== shipmentId));
      alert("Shipment deleted successfully.");
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert("Failed to delete shipment.");
    }
  };

  // Function to Edit Cargo
  const handleEditCargoClick = (cargo) => {
    setEditingCargo(cargo);
    setEditCargoFormData({ ...cargo });
  };

  const handleEditCargoChange = (e) => {
    setEditCargoFormData({ ...editCargoFormData, [e.target.name]: e.target.value });
  };

  const handleEditCargoSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/cargo/${editingCargo._id}`,
        editCargoFormData,
        {
          headers: {
            'user-role': user?.role || '',
            'user-id': user?.id || ''
          }
        }
      );
      setCargoOrders(cargoOrders.map(c => c._id === editingCargo._id ? res.data.cargo : c));
      setEditingCargo(null);
      alert("Cargo updated successfully.");
    } catch (error) {
      console.error('Error updating cargo:', error);
      alert("Failed to update cargo.");
    }
  };

  // Function to Delete Cargo
  const handleDeleteCargo = async (cargoId) => {
    if (!window.confirm("Are you sure you want to delete this cargo order?")) return;
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      await axios.delete(`${API_BASE_URL}/api/admin/cargo/${cargoId}`, {
        headers: {
          'user-role': user?.role || '',
          'user-id': user?.id || ''
        }
      });
      setCargoOrders(cargoOrders.filter(c => c._id !== cargoId));
      alert("Cargo order deleted successfully.");
    } catch (error) {
      console.error('Error deleting cargo:', error);
      alert("Failed to delete cargo order.");
    }
  };

  // Function to Send Email Reply
  const handleSendReply = async () => {
    if (!adminReply) return alert("Please type a response first.");
    setIsSending(true);

    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.post(`${API_BASE_URL}/api/admin/reply`, {
        messageId: replyingTo._id,
        userEmail: replyingTo.email,
        originalMsg: replyingTo.message,
        replyText: adminReply
      }, {
        headers: { 'user-role': user?.role || 'admin' }
      });

      alert(res.data.message);
      setReplyingTo(null); // Close Modal
      setAdminReply("");   // Clear text
      window.location.reload(); // Refresh to update status
    } catch (err) {
      alert("Failed to send email. Check backend connections.");
    } finally {
      setIsSending(false);
    }
  };

  // Function to Update Site Content
  const handleSiteContentChange = (e) => {
    setSiteContent({ ...siteContent, [e.target.name]: e.target.value });
  };

  const handleSaveSiteContent = async (e) => {
    e.preventDefault();
    setIsSavingContent(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.put(`${API_BASE_URL}/api/content`, siteContent, {
        headers: { 'user-role': user?.role || 'admin' }
      });
      alert(res.data.message);
    } catch (err) {
      console.error('Error saving site content:', err);
      alert("Failed to save site content.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleShipmentStatusChange = async (shipmentId, newStatus) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      const res = await axios.patch(
        `${API_BASE_URL}/api/admin/shipments/${shipmentId}/status`,
        { status: newStatus },
        { headers: { 'user-role': user?.role || 'admin', 'user-id': user?.id || '' } }
      );
      setShipments(shipments.map(s => s._id === shipmentId ? res.data.shipment : s));
      alert("Shipment status updated successfully.");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout from Admin Panel?")) {
      sessionStorage.clear();
      setIsAdmin(false);
      setLoginStep('credentials');
      // No redirection to "/"
    }
  };

  if (authChecking) {
    return <div className="admin-spinner-container"><div className="admin-spinner"></div></div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: '#141414', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '400px', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', overflow: 'hidden' }}>
              <img src="/pictures/logo.jpeg" alt="E-Drop Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{ color: 'white', margin: 0 }}>Admin Portal</h2>
            <p style={{ color: '#888', marginTop: '10px' }}>Access restricted to authorized personnel</p>
          </div>
          
          {loginStep === 'credentials' ? (
            <form onSubmit={handleAdminLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Admin Email</label>
                <input 
                  type="email" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '8px', color: 'white', outline: 'none' }}
                  placeholder="admin@edrop.com"
                  required
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>Security Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showAdminPass ? "text" : "password"} 
                    value={adminPass} 
                    onChange={(e) => setAdminPass(e.target.value)} 
                    style={{ width: '100%', padding: '12px', paddingRight: '45px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '8px', color: 'white', outline: 'none' }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b35', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 5px' }}
                  >
                    <i className={showAdminPass ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>
              {loginError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>{loginError}</p>}
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s' }}>
                Next: Verify OTP
              </button>
              <button type="button" onClick={() => setLoginStep('forgot')} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#ff6b35', border: 'none', marginTop: '15px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
                Forgot Password?
              </button>
            </form>
          ) : loginStep === 'otp' ? (
            <form onSubmit={handleAdminOtpVerify}>
              <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <p style={{ color: '#2ecc71', fontSize: '0.9rem', marginBottom: '15px' }}>✅ Password Verified! Check your email for OTP.</p>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '10px', fontSize: '1rem' }}>Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  maxLength="6"
                  value={adminOtp} 
                  onChange={(e) => setAdminOtp(e.target.value)} 
                  style={{ width: '100%', padding: '15px', backgroundColor: '#000', border: '1px solid #ff6b35', borderRadius: '8px', color: 'white', outline: 'none', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '8px' }}
                  placeholder="000000"
                  required
                />
              </div>
              {loginError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>{loginError}</p>}
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s' }}>
                Verify & Enter Dashboard
              </button>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLoginError(''); setAdminOtp(''); setLoginStep('credentials'); }} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#888', border: 'none', marginTop: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Wrong Email? Go Back
              </button>
            </form>
          ) : loginStep === 'forgot' ? (
            <form onSubmit={handleAdminForgotPassword}>
                <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                    <h3 style={{ color: 'white', marginBottom: '10px' }}>Reset Security Password</h3>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Enter your admin email to receive a recovery code.</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '8px' }}>Admin Email</label>
                    <input 
                        type="email" 
                        value={adminEmail} 
                        onChange={(e) => setAdminEmail(e.target.value)} 
                        style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '8px', color: 'white', outline: 'none' }}
                        required
                    />
                </div>
                {loginError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '20px' }}>{loginError}</p>}
                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Send Recovery OTP
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLoginError(''); setLoginStep('credentials'); }} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#888', border: 'none', marginTop: '10px', cursor: 'pointer' }}>
                    Back to Login
                </button>
            </form>
          ) : (
            <form onSubmit={handleAdminResetPassword}>
                <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                    <h3 style={{ color: 'white', marginBottom: '10px' }}>Create New Password</h3>
                    <p style={{ color: '#2ecc71', fontSize: '0.9rem' }}>Verification code sent to {adminEmail}</p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '8px' }}>6-Digit OTP</label>
                    <input 
                        type="text" 
                        maxLength="6"
                        value={adminOtp} 
                        onChange={(e) => setAdminOtp(e.target.value)} 
                        style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '8px', color: 'white', outline: 'none', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', color: '#ccc', marginBottom: '8px' }}>New Security Password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                          type={showNewAdminPass ? "text" : "password"} 
                          value={newAdminPass} 
                          onChange={(e) => setNewAdminPass(e.target.value)} 
                          style={{ width: '100%', padding: '12px', paddingRight: '45px', backgroundColor: '#000', border: '1px solid #444', borderRadius: '8px', color: 'white', outline: 'none' }}
                          placeholder="Min 8 chars, 1 Uppercase, 1 Special"
                          required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewAdminPass(!showNewAdminPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b35', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 5px' }}
                      >
                        <i className={showNewAdminPass ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                      </button>
                    </div>
                </div>
                {loginError && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '20px' }}>{loginError}</p>}
                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Reset & Back to Login
                </button>
            </form>
          )}
          
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>← Return to Main Website</a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-spinner-container">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  const pendingMessagesCount = messages.filter(m => m.status === 'pending').length;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-logo">
            <img src="/pictures/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span>AdminPanel</span>
        </div>

        <nav className="admin-nav">
          <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            Overview
          </button>
          <button className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Users
          </button>
          <button className={`nav-btn ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Shipments
          </button>
          <button className={`nav-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Messages
            {pendingMessagesCount > 0 && <span className="nav-badge">{pendingMessagesCount}</span>}
          </button>

          <button className={`nav-btn ${activeTab === 'cargo' ? 'active' : ''}`} onClick={() => setActiveTab('cargo')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline></svg>
            Cargo Orders
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="back-website-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Back to Website
          </a>
          <button onClick={handleLogout} className="admin-logout-btn" style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            color: '#ff4d4d',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '10px',
            fontWeight: 'bold',
            transition: '0.3s'
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Admin Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search across dashboard..." />
          </div>
          <div className="header-profile">
            <div className="profile-info">
              <span className="profile-name">{adminUser?.fullName || 'Super Admin'}</span>
              <span className="profile-role" style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'lowercase' }}>{adminUser?.email || 'admin@edrop.com'}</span>
            </div>
            <div className="profile-avatar">{adminUser?.fullName ? adminUser.fullName.charAt(0).toUpperCase() : 'A'}</div>
          </div>
        </header>

        <div className="admin-content-area">
          {/* Overview Content */}
          {activeTab === 'overview' && (
            <div className="fade-in">
              <h1 className="page-heading">Dashboard Overview</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon users-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="stat-details">
                    <h3>Total Users</h3>
                    <p className="stat-number">{users.length}</p>
                    <span className="stat-trend neutral">Total registered accounts</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon users-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div className="stat-details">
                    <h3>Drivers</h3>
                    <p className="stat-number">{users.filter(u => u.role === 'driver').length}</p>
                    <span className="stat-trend positive">Active drivers</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon messages-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <div className="stat-details">
                    <h3>Total Shipments</h3>
                    <p className="stat-number">{shipments.length}</p>
                    <span className="stat-trend neutral">All tracked orders</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon pending-icon" style={{ backgroundColor: 'rgba(230, 126, 34, 0.15)', color: '#e67e22' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                  </div>
                  <div className="stat-details">
                    <h3>Cargo Orders</h3>
                    <p className="stat-number">{cargoOrders.length}</p>
                    <span className="stat-trend neutral">Inland deliveries</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon pending-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="stat-details">
                    <h3>Pending Replies</h3>
                    <p className="stat-number">{pendingMessagesCount}</p>
                    <span className="stat-trend negative">Needs your attention</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <div className="fade-in">
              <h1 className="page-heading">User Management</h1>
              <div className="admin-card">
                <div className="card-body p-0">
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>User Account</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Password</th>
                        <th>Joined Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map(u => (
                          <tr key={u._id}>
                            <td>
                              <div className="user-cell">
                                <div className="user-avatar-md">{u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}</div>
                                <div>
                                  <div className="user-name">{u.fullName || 'Unknown User'}</div>
                                  <div className="user-email">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="dim-text">{u.phone}</span></td>
                            <td><span className={`pill ${u.role}`}>{u.role}</span></td>
                            <td>
                                <span className="dim-text" style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#ff6b35' }} title={u.password}>
                                  {u.password && u.password.startsWith('$2') 
                                      ? u.password.substring(0, 12) + '...' 
                                      : '••••••••' + (u.password ? u.password.slice(-2) : '')}
                                </span>
                            </td>
                            <td><span className="date-text">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="secondary-btn" 
                                  style={{ backgroundColor: '#3498db', color: '#fff', borderColor: '#3498db', padding: '6px 12px' }}
                                  onClick={() => handleEditClick(u)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="secondary-btn" 
                                  style={{ backgroundColor: '#ff4d4d', color: '#fff', borderColor: '#ff4d4d', padding: '6px 12px' }}
                                  onClick={() => handleDeleteUser(u._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            <span className="dim-text">No users found.</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab Content */}
          {activeTab === 'messages' && (
            <div className="fade-in">
              <h1 className="page-heading">Customer Messages</h1>
              <div className="admin-card">
                <div className="card-body p-0">
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map(msg => (
                        <tr key={msg._id}>
                          <td>
                            <div className="user-cell">
                              <div>
                                <div className="user-name">{msg.name}</div>
                                <div className="user-email" style={{ fontSize: '0.8rem', opacity: 0.7 }}>{msg.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <p className="message-snippet" title={msg.message}>{msg.message}</p>
                          </td>
                          <td><span className={`pill ${msg.status || 'pending'}`}>{msg.status || 'pending'}</span></td>
                          <td><span className="date-text">{new Date(msg.createdAt).toLocaleDateString()}</span></td>
                          <td>
                            <button className="secondary-btn" onClick={() => setReplyingTo(msg)}>
                              Reply
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Shipments Tab Content */}
          {activeTab === 'shipments' && (
            <div className="fade-in">
              <h1 className="page-heading">Shipment Orders</h1>
              <div className="admin-card">
                <div className="card-body p-0">
                  <div style={{ overflowX: 'auto', padding: '10px' }}>
                  <table className="pro-table" style={{ minWidth: '1000px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '120px' }}>Tracking ID</th>
                        <th style={{ minWidth: '180px' }}>Customer</th>
                        <th style={{ minWidth: '220px' }}>Product & Route</th>
                        <th style={{ minWidth: '200px' }}>Notes</th>
                        <th style={{ minWidth: '150px' }}>Status</th>
                        <th style={{ minWidth: '200px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.length > 0 ? shipments.map(shipment => (
                        <tr key={shipment._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong>{shipment.trackingID}</strong>
                                {shipment.flagged && (
                                    <span title={`Suspicious: ${shipment.fraudReason}`} style={{ cursor: 'help', fontSize: '1.2rem' }}>⚠️</span>
                                )}
                            </div>
                            <div className="dim-text" style={{ fontSize: '0.8rem', marginTop: '4px', whiteSpace: 'nowrap' }}>
                              {new Date(shipment.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td>
                            <div className="user-name">{shipment.fullName}</div>
                            <div className="user-email" style={{ fontSize: '0.8rem', opacity: 0.7 }}>{shipment.email}</div>
                            <div className="user-phone" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                              <span style={{color: '#ff6b35'}}>📞</span> {shipment.phone}
                            </div>
                          </td>
                          <td>
                            <div><strong>{shipment.productName}</strong> ({shipment.category})</div>
                            <div className="dim-text" style={{ fontSize: '0.8rem' }}>{shipment.originCountry} → {shipment.destinationCity}</div>
                            <div className="dim-text" style={{ fontSize: '0.8rem', marginTop: '2px', color: '#3498db' }}>⚓ Port: {shipment.preferredPort || 'Not specified'}</div>
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            {shipment.notes ? (
                                <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#ff6b35', backgroundColor: 'rgba(255, 107, 53, 0.1)', padding: '8px', borderRadius: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {shipment.notes}
                                </div>
                            ) : (
                                <span className="dim-text" style={{fontSize: '0.85rem'}}>-</span>
                            )}
                          </td>
                          <td><span className={`pill ${shipment.status.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase()}`}>{shipment.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <select 
                                value={shipment.status} 
                                onChange={(e) => handleShipmentStatusChange(shipment._id, e.target.value)}
                                style={{ 
                                  padding: '6px', 
                                  borderRadius: '6px', 
                                  border: '1px solid #d1d5db', 
                                  backgroundColor: '#f9fafb', 
                                  color: '#1f2937', 
                                  outline: 'none' 
                                }}
                              >
                                <option value="Order Submitted">Order Submitted</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped from Origin">Shipped from Origin</option>
                                <option value="Arrived at Port (Pakistan)">Arrived at Port (Pakistan)</option>
                                <option value="In Cargo Transit">In Cargo Transit</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  className="secondary-btn" 
                                  style={{ backgroundColor: '#3498db', color: '#fff', borderColor: '#3498db', padding: '4px 10px', fontSize: '0.8rem' }}
                                  onClick={() => handleEditShipmentClick(shipment)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="secondary-btn" 
                                  style={{ backgroundColor: '#ff4d4d', color: '#fff', borderColor: '#ff4d4d', padding: '4px 10px', fontSize: '0.8rem' }}
                                  onClick={() => handleDeleteShipment(shipment._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                            <span className="dim-text">No shipments found.</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cargo Orders Tab Content */}
          {activeTab === 'cargo' && (
            <div className="fade-in">
              <h1 className="page-heading">Inland Cargo Orders</h1>
              <div className="admin-card">
                <div className="card-body p-0">
                  <div style={{ overflowX: 'auto', padding: '10px' }}>
                  <table className="pro-table" style={{ minWidth: '1000px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '120px' }}>Tracking ID</th>
                        <th style={{ minWidth: '180px' }}>Receiver</th>
                        <th style={{ minWidth: '220px' }}>Cargo & Address</th>
                        <th style={{ minWidth: '150px' }}>Status</th>
                        <th style={{ minWidth: '200px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargoOrders.length > 0 ? cargoOrders.map(cargo => (
                        <tr key={cargo._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong>{cargo.trackingID}</strong>
                                {cargo.flagged && (
                                    <span title={`Suspicious: ${cargo.fraudReason}`} style={{ cursor: 'help', fontSize: '1.2rem' }}>⚠️</span>
                                )}
                            </div>
                            <div className="dim-text" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                              {new Date(cargo.createdAt).toLocaleString()}
                            </div>
                            {cargo.linkedTrackingID && (
                                <div style={{ fontSize: '0.75rem', color: '#3498db', marginTop: '4px' }}>
                                    Ref: {cargo.linkedTrackingID}
                                </div>
                            )}
                          </td>
                          <td>
                            <div className="user-name">{cargo.receiverName}</div>
                            <div className="user-phone" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                              <span style={{color: '#ff6b35'}}>📞</span> {cargo.receiverPhone}
                            </div>
                          </td>
                          <td>
                            <div><strong>{cargo.cargoType}</strong> ({cargo.deliveryPriority})</div>
                            <div className="dim-text" style={{ fontSize: '0.8rem' }}>City: {cargo.destinationCity}</div>
                            <div className="dim-text" style={{ fontSize: '0.8rem', wordBreak: 'break-word' }}>{cargo.deliveryAddress}</div>
                          </td>
                          <td><span className={`pill ${cargo.status.toLowerCase().replace(/\s+/g, '-')}`}>{cargo.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <select 
                                value={cargo.status} 
                                onChange={(e) => handleCargoStatusChange(cargo._id, e.target.value)}
                                style={{ 
                                  padding: '6px', 
                                  borderRadius: '6px', 
                                  border: '1px solid #d1d5db', 
                                  backgroundColor: '#f9fafb', 
                                }}
                              >
                                <option value="Booked">Booked</option>
                                <option value="Picked Up">Picked Up</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button 
                                  className="secondary-btn" 
                                  style={{ backgroundColor: '#3498db', color: '#fff', borderColor: '#3498db', padding: '4px 10px', fontSize: '0.8rem' }}
                                  onClick={() => handleEditCargoClick(cargo)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="secondary-btn" 
                                  style={{ backgroundColor: '#ff4d4d', color: '#fff', borderColor: '#ff4d4d', padding: '4px 10px', fontSize: '0.8rem' }}
                                  onClick={() => handleDeleteCargo(cargo._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            <span className="dim-text">No cargo orders found.</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </main>

      {/* REPLY MODAL UI */}
      {replyingTo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', width: '450px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#ff6b35', marginTop: 0 }}>Reply to {replyingTo.name}</h2>
            <div style={{ backgroundColor: '#000', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
              <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}><strong>User Sent:</strong></p>
              <p style={{ color: '#eee', fontSize: '0.9rem', margin: '5px 0 0 0' }}>{replyingTo.message}</p>
            </div>

            <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Your Response:</label>
            <textarea
              style={{ width: '100%', height: '120px', marginTop: '8px', padding: '12px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px', outline: 'none', resize: 'none' }}
              placeholder="Write your email reply here..."
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
            />

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleSendReply} 
                disabled={isSending} 
                style={{ backgroundColor: '#2ecc71', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 2, cursor: isSending ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isSending ? 0.7 : 1 }}
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </button>
              <button onClick={() => setReplyingTo(null)} disabled={isSending} style={{ backgroundColor: '#444', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 1, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', width: '450px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#ff6b35', marginTop: 0 }}>Edit User</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Full Name</label>
                <input type="text" name="fullName" value={editFormData.fullName} onChange={handleEditChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Phone</label>
                <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Role</label>
                <select name="role" value={editFormData.role} onChange={handleEditChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }}>
                  <option value="customer">Customer</option>
                  <option value="driver">Driver</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ backgroundColor: '#3498db', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 2, cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingUser(null)} style={{ backgroundColor: '#444', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 1, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHIPMENT MODAL */}
      {editingShipment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, overflowY: 'auto', padding: '20px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', width: '500px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#ff6b35', marginTop: 0 }}>Edit Shipment</h2>
            <form onSubmit={handleEditShipmentSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Product Name</label>
                <input type="text" name="productName" value={editShipmentFormData.productName || ''} onChange={handleEditShipmentChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Category</label>
                <input type="text" name="category" value={editShipmentFormData.category || ''} onChange={handleEditShipmentChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Origin Country</label>
                <input type="text" name="originCountry" value={editShipmentFormData.originCountry || ''} onChange={handleEditShipmentChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Destination City</label>
                <input type="text" name="destinationCity" value={editShipmentFormData.destinationCity || ''} onChange={handleEditShipmentChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Preferred Port</label>
                <input type="text" name="preferredPort" value={editShipmentFormData.preferredPort || ''} onChange={handleEditShipmentChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Notes</label>
                <textarea name="notes" value={editShipmentFormData.notes || ''} onChange={handleEditShipmentChange} style={{ width: '100%', height: '80px', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ backgroundColor: '#3498db', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 2, cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingShipment(null)} style={{ backgroundColor: '#444', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 1, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CARGO MODAL */}
      {editingCargo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, overflowY: 'auto', padding: '20px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', width: '500px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#ff6b35', marginTop: 0 }}>Edit Cargo Order</h2>
            <form onSubmit={handleEditCargoSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Receiver Name</label>
                <input type="text" name="receiverName" value={editCargoFormData.receiverName || ''} onChange={handleEditCargoChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Receiver Phone</label>
                <input type="text" name="receiverPhone" value={editCargoFormData.receiverPhone || ''} onChange={handleEditCargoChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Cargo Type</label>
                <input type="text" name="cargoType" value={editCargoFormData.cargoType || ''} onChange={handleEditCargoChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Delivery Priority</label>
                <input type="text" name="deliveryPriority" value={editCargoFormData.deliveryPriority || ''} onChange={handleEditCargoChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Destination City</label>
                <input type="text" name="destinationCity" value={editCargoFormData.destinationCity || ''} onChange={handleEditCargoChange} style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Delivery Address</label>
                <textarea name="deliveryAddress" value={editCargoFormData.deliveryAddress || ''} onChange={handleEditCargoChange} style={{ width: '100%', height: '80px', padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '6px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ backgroundColor: '#3498db', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 2, cursor: 'pointer', fontWeight: 'bold' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingCargo(null)} style={{ backgroundColor: '#444', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', flex: 1, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
