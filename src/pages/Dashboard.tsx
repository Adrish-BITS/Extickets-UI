import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginAdmin, logout, User } from '../redux/slice';
import { RootState } from '../redux/store';
import './Dashboard.css';
import bgImage from './bg.jpg';
import logo from './logo.png';
import VerticalCarousel from './Carousal';

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
                <img src={logo} alt="TicketWave Logo" style={{ height: '100px', width: '180px' }} />
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

      <main className="hero-layout">
      <div className="hero-left">
  <h1 className="hero-title">
    Welcome to <span className="white-text">TicketWave</span>
  </h1>

  <h2 className="hero-subtitle">Your Smart Way to Sell and Buy Tickets</h2>

  <p className="hero-desc">
    Got a ticket for an event you can’t attend anymore? No worries —
    <strong> Extickets </strong> makes it super easy to sell your unused tickets or
    discover verified ones from other users. Instead of letting great seats go to
    waste, simply upload your ticket and let someone else enjoy the moment!
  </p>

  <h3 className="hero-section-title">Why Extickets?</h3>
  <ul className="hero-list">
    <li>Every ticket undergoes a <strong>verification process</strong> to ensure authenticity.</li>
    <li>Sellers can quickly upload and list tickets for <strong>admin approval</strong>.</li>
    <li>Buyers can browse available options, compare prices, and purchase securely.</li>
    <li>Instant confirmation ensures a <strong>smooth and trusted experience</strong>.</li>
    <li>Perfect for movies, concerts, sports, or any event ticket you can’t use!</li>
  </ul>

  <h3 className="hero-section-title">A Seamless Experience</h3>
  <p className="hero-desc">
    Whether you're buying or selling, TicketWave connects the right ticket to the
    right person at the right time. Sellers can turn unused tickets into value,
    while buyers can grab last-minute opportunities with confidence.
  </p>

  <p className="hero-desc">
    Don’t let good seats go unused. Your ticket could be someone’s perfect moment —
    and their ticket could be yours.
  </p>

  <h3 className="hero-call-to-action">Ready to get started?</h3>
  <p className="hero-desc">
    Upload your ticket now or explore available listings and secure your spot at
    your favorite event — before it’s too late!
  </p>
</div>


  <div className="hero-right">
    <VerticalCarousel />
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
