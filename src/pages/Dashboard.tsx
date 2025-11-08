import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginAdmin, logout, User } from '../redux/slice';
import { RootState } from '../redux/store';
import './Dashboard.css';
import bgImage from './bg.jpg';
import logo from './logo.png';

export default function Dashboard() {
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openAdminModal, setOpenAdminModal] = useState(false);
  const [openAboutModal, setOpenAboutModal] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);

  // Google login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const googleToken = credentialResponse?.credential;
    if (!googleToken) return;
    try {
      const res = await fetch("http://192.168.29.94:8081/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: googleToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        name: data.name,
        email: data.email,
        role: 'user',
        isGoogle: true,
      }));

      dispatch(loginWithGoogle({
        name: data.name,
        email: data.email,
        role: 'user',
        isGoogle: true,
      }));

      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };

  // Admin login
  const handleAdminLogin = () => {
    const { username, password } = adminCredentials;
    if (username === 'admin' && password === 'admin123') {
      const adminUser: User = { name: 'Admin', email: 'admin@company.com', role: 'admin' };
      localStorage.setItem('token', 'admin-token');
      dispatch(loginAdmin(adminUser));
      navigate('/home');
    } else {
      setAdminError('Invalid admin credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="nav-header">
        <nav className="nav-container">
          <div className="nav-content">
            <div className="logo-container">
              <a href="#" className="logo-link">
                <img src={logo} alt="TicketWave Logo" style={{ height: '90px', width: '110px' }} />
              </a>
            </div>
            <div className="nav-links">
              <button className="nav-link" onClick={() => setOpenUserModal(true)}>Sell/Buy tickets</button>
              <button className="nav-link" onClick={() => setOpenAdminModal(true)}>Admin Login</button>
              <button className="nav-link" onClick={() => setOpenAboutModal(true)}>About Us</button>
            </div>
            <div className="mobile-btn">
              <button onClick={() => setHamburgerOpen(!hamburgerOpen)} className="hamburger">
                <svg className="icon" viewBox="0 0 24 24">
                  {hamburgerOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {hamburgerOpen && (
            <div className="mobile-menu">
              <button className="mobile-link" onClick={() => setOpenUserModal(true)}>Sell/Buy tickets</button>
              <button className="mobile-link" onClick={() => setOpenAdminModal(true)}>Admin Login</button>
              <button className="mobile-link" onClick={() => setOpenAboutModal(true)}>About Us</button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="content-wrapper">
        <div
          className="hero-bg"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <h1 className="hero-title">Welcome to <span className="white-text">TicketWave</span></h1>
          <p className="hero-desc">Sell, manage and explore events with a slick, neon inspired interface.</p>
        </div>
      </main>

      {/* User Modal */}
      {openUserModal && (
        <div className="modal-overlay" onClick={() => setOpenUserModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Login to Sell/Buy Tickets</h2>
            <p className="modal-desc">Use your Google account to quickly login</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google login failed")}
              size="large"
            />
            <button onClick={() => setOpenUserModal(false)} className="close-btn">Cancel</button>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {openAdminModal && (
        <div className="modal-overlay" onClick={() => setOpenAdminModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Admin Login</h2>
            <p className="modal-desc">Enter credentials to access admin panel</p>
            <input
              type="text"
              placeholder="Username"
              value={adminCredentials.username}
              onChange={e => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
              className="input-field"
            />
            <input
              type="password"
              placeholder="Password"
              value={adminCredentials.password}
              onChange={e => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
              className="input-field"
            />
            <button onClick={handleAdminLogin} className="btn-primary">Login as Admin</button>
            {adminError && <p className="error-text">{adminError}</p>}
            <button onClick={() => setOpenAdminModal(false)} className="close-btn">Cancel</button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {openAboutModal && (
        <div className="modal-overlay" onClick={() => setOpenAboutModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">About Us</h2>
            <p>TicketWave is your ultimate platform for buying and selling event tickets...</p>
            <button onClick={() => setOpenAboutModal(false)} className="close-btn">Close</button>
          </div>
        </div>
      )}

      {/* Logout */}
      {isLoggedIn && (
        <button style={{ position: 'fixed', bottom: 20, right: 20 }} onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}
