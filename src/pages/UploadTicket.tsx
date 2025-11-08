import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addTicket } from '../redux/ticketsSlice';
import { AppDispatch, RootState } from '../redux/store';
import { logout } from '../redux/slice';
import logo from './logo.png';
import './Dashboard.css';

export default function UploadTicket() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [form, setForm] = useState({
    eventName: '',
    eventDateTime: '',
    venue: '',
    price: '',
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('eventName', form.eventName);
    formData.append('eventDateTime', form.eventDateTime);
    formData.append('venue', form.venue);
    formData.append('price', form.price);
    if (eventImageFile) formData.append('eventImage', eventImageFile);
    if (ticketFile) formData.append('file', ticketFile);

    try {
      const idToken = localStorage.getItem('token');
      const res = await fetch('http://192.168.29.94:8080/api/tickets/upload', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const uploadedTicket = await res.json().catch(() => null);
      if (uploadedTicket) dispatch(addTicket(uploadedTicket));

      navigate('/home', { state: { showMyTickets: true } });
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Ticket upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="nav-header">
        <nav className="nav-container">
          <div className="nav-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                onClick={() => navigate('/home')}
                className="nav-link"
                style={{ background: 'transparent', color: '#5eead4', fontSize: '18px', border: 'none', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <a href="#" className="logo-link">
                <img src={logo} alt="TicketWave Logo" style={{ height: '60px', width: '80px' }} />
              </a>
            </div>

            <div className="nav-links">
              <button onClick={() => setProfileModalOpen(true)} className="nav-link">Profile</button>
              <button onClick={handleLogout} className="nav-link" style={{ backgroundColor: '#dc3545' }}>Logout</button>
            </div>
          </div>
        </nav>
      </header>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>User Profile</h2>
            <p><strong>Name:</strong> {user?.name || 'John Doe'}</p>
            <p><strong>Email:</strong> {user?.email || 'john@example.com'}</p>
            <p><strong>Role:</strong> {user?.role || 'user'}</p>
            <p><strong>About:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <button onClick={() => setProfileModalOpen(false)} className="close-btn">Close</button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <div className="upload-container">
        <div className="upload-card">
          <h2 className="upload-title">Upload Your Ticket</h2>

          <form onSubmit={handleSubmit} className="upload-form">
            <input
              placeholder="Event Name"
              value={form.eventName}
              onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              required
              className="input-field"
            />
            <input
              type="datetime-local"
              value={form.eventDateTime}
              onChange={(e) => setForm({ ...form, eventDateTime: e.target.value })}
              required
              className="input-field"
            />
            <input
              placeholder="Venue"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              required
              className="input-field"
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="input-field"
            />

            <label className="file-label">
              Event Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEventImageFile(e.target.files?.[0] || null)}
                required
                className="file-input"
              />
            </label>

            <label className="file-label">
              Ticket PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                required
                className="file-input"
              />
            </label>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Uploading...' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      </div>

      {/* Loader Modal */}
      {loading && (
        <div className="loader-overlay">
          <div className="loader-modal">
            <p>Uploading... Please wait ⏳</p>
          </div>
        </div>
      )}
    </div>
  );
}
