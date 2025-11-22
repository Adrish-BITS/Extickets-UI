import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addTicket } from '../redux/ticketsSlice';
import { AppDispatch, RootState } from '../redux/store';
import { logout } from '../redux/slice';
import logo from './logo.png';
import './Dashboard.css';

const indianCities = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad",
  "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow",
  "Nagpur", "Surat", "Vadodara", "Vijayawada", "Visakhapatnam",
  "Bhopal", "Coimbatore", "Indore", "Thiruvananthapuram", "Guwahati",
];

interface Ticket {
  bookingId: string;
  [key: string]: any;
}

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
    bookingId: '',
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/');
  };

  // Fetch existing tickets for the user
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!user) return;
      const idToken = localStorage.getItem('token');
      try {
        const res = await fetch(`http://192.168.29.94:8080/api/tickets/user/${user.email}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new Error('Failed to fetch user tickets');
        const data = await res.json();
        setUserTickets(Array.isArray(data) ? data : data.tickets || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate Booking ID
    const duplicate = userTickets.find(ticket => ticket.bookingId === form.bookingId);
    if (duplicate) {
      alert('Error: A ticket with this Booking ID already exists!');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('bookingId', form.bookingId);
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
    
      if (!res.ok) {
        // Only show a friendly message instead of raw URL
        const msg = res.status === 409 
          ? 'A ticket with this Booking ID already exists!'
          : 'Ticket upload failed. Please try again.';
        throw new Error(msg);
      }
    
      const uploadedTicket = await res.json().catch(() => null);
      if (uploadedTicket) dispatch(addTicket(uploadedTicket));
    
      navigate('/home', { state: { showMyTickets: true } });
    } catch (err: any) {
      console.error('Upload failed:', err);
      // Show friendly alert without localhost or URL
      alert(err.message || 'Ticket upload failed. Please try again.');
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
              <a href="#" className="logo-link">
                <img src={logo} alt="TicketWave Logo" style={{ height: '100px', width: '150px' }} />
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
          <h2 className="upload-title">Upload Ticket</h2>

          <form onSubmit={handleSubmit} className="upload-form">

            <div className="form-row">
              <label>Booking ID:</label>
              <input
                type="text"
                placeholder="Booking ID"
                value={form.bookingId}
                onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div className="form-row">
              <label>Event Name:</label>
              <input
                type="text"
                placeholder="Event Name"
                value={form.eventName}
                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div className="form-row">
              <label>Date:</label>
              <input
                type="datetime-local"
                value={form.eventDateTime}
                onChange={(e) => setForm({ ...form, eventDateTime: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div className="form-row">
              <label>Venue (City):</label>
              <select
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                required
                className="input-field"
              >
                <option value="">Select City</option>
                {indianCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Price:</label>
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="input-field"
              />
            </div>

            <div className="form-row">
              <label>Event Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEventImageFile(e.target.files?.[0] || null)}
                required
                className="file-input"
              />
            </div>

            <div className="form-row">
              <label>Ticket PDF:</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                required
                className="file-input"
              />
            </div>

            <div className="button-row">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Uploading...' : 'Submit for Approval'}
              </button>
              <button type="button" onClick={() => navigate('/home')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>

          <div className="upload-instructions">
            <strong>Instructions:</strong>
            <ul>
              <li>Upload a clear image or PDF of the ticket. Ensure the text, QR/barcode, and seat details are fully visible.</li>
              <li>Verify the event date and time before submitting to avoid buyer confusion or disputes.</li>
              <li>Enter seat, row, and section exactly as printed on the ticket. Even small errors may cause the buyer to lose entry.</li>
              <li>Do not include any personal information such as your name, phone number, or booking account details in the uploaded image.</li>
              <li>Your ticket will first undergo admin review. Only after approval will it be made visible to buyers for purchase.</li>
            </ul>
          </div>
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
