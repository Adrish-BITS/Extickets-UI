import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slice';
import { RootState } from '../redux/store';
import './Dashboard.css';
import logo from './logo.png';

interface Ticket {
  id: string;
  eventName: string;
  eventDateTime: string;
  venue: string;
  price: number;
  userEmail?: string;
  eventImagePath?: string;
  filePath?: string;
  status?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'approved' | 'mytickets'>('approved');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ type: 'image' | 'pdf'; url: string } | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const idToken = localStorage.getItem('token');

  useEffect(() => {
    if (!user || !idToken) {
      dispatch(logout());
      navigate('/');
    }
  }, [user, idToken, navigate, dispatch]);

  const fetchTickets = async () => {
    if (!idToken || !user) return;
  
    setLoading(true);
    setError('');
  
    try {
      let url = '';
  
      if (user.role === 'admin') {
        url = 'http://192.168.29.94:8084/api/admin/tickets/status/in-review';
      } else {
        url = activeTab === 'approved'
          ? 'http://192.168.29.94:8084/api/admin/tickets/status/approved'
          : `http://192.168.29.94:8080/api/tickets/user/${user.email}`;
      }
  
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!res.ok) throw new Error(`Failed to fetch tickets (${res.status})`);
  
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : data.tickets || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTickets();
  }, [activeTab, idToken, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/");
  };

  const openModal = (url: string, type: 'image' | 'pdf') => {
    setModalContent({ type, url });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const handleApprove = async (ticket: Ticket) => {
    if (!idToken) return;
    try {
      setApproving(true);
      const res = await fetch(
        `http://192.168.29.94:8084/api/admin/tickets/ticket/${ticket.id}/changeStatus/approved/comments/null`,
        { method: 'POST', headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) throw new Error(`Failed to approve ticket (${res.status})`);
      alert('Ticket approved successfully!');
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedTicket || !idToken) return;
    try {
      setApproving(true);
      const res = await fetch(
        `http://192.168.29.94:8084/api/admin/tickets/ticket/${selectedTicket.id}/changeStatus/rejected/comments/${rejectComment}`,
        { method: "POST", headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to reject ticket");
      alert("Ticket rejected.");
      setRejectModalOpen(false);
      setRejectComment("");
      fetchTickets();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="nav-header">
        <nav className="nav-container">
          <div className="nav-content">
          <a href="#" className="logo-link">
  <img 
    src={logo} 
    alt="TicketWave Logo" 
    style={{ height: '90px', width: '110px' }} 
  />
</a>
            <div className="nav-links">
              {user?.role !== 'admin' && <button onClick={() => navigate('/upload')} className="nav-link">Upload Ticket</button>}
              <button onClick={() => setProfileModalOpen(true)} className="nav-link">Profile</button>
              {user?.role !== 'admin' && (
                <button
                  onClick={() => setActiveTab(activeTab === 'approved' ? 'mytickets' : 'approved')}
                  className="nav-link"
                >
                  {activeTab === 'approved' ? 'My Tickets' : 'Approved Tickets'}
                </button>
              )}
              <button onClick={handleLogout} className="nav-link" style={{ backgroundColor: '#dc3545' }}>Logout</button>
            </div>
          </div>
        </nav>
      </header>

      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>User Profile</h2>
            <p><strong>Name:</strong> {user?.name || 'John Doe'}</p>
            <p><strong>Email:</strong> {user?.email || 'john@example.com'}</p>
            <p><strong>Role:</strong> {user?.role || 'user'}</p>
            <p><strong>About:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ut eros non quam vehicula.</p>
            <button onClick={() => setProfileModalOpen(false)} className="close-btn">Close</button>
          </div>
        </div>
      )}

      <main className="content-wrapper">
        <h2 style={{ color: '#5eead4', marginBottom: '20px' }}>
          {user?.role === 'admin' ? 'New Tickets (In-Review)' : activeTab === 'approved' ? 'Approved Tickets' : 'My Tickets'}
        </h2>

        {loading ? <p>Loading tickets...</p> :
         error ? <p style={{ color: 'red' }}>{error}</p> :
         tickets.length === 0 ? <p>No tickets found.</p> :
         <div className="tickets-grid">
          {tickets.map(ticket => (
            <div key={ticket.id} className="hero-card">
              {ticket.eventImagePath && (
                <img src={ticket.eventImagePath} alt={ticket.eventName} onClick={() => openModal(ticket.eventImagePath!, 'image')} />
              )}
              <h3>{ticket.eventName}</h3>
              <p><strong>Venue:</strong> {ticket.venue}</p>
              <p><strong>Date:</strong> {new Date(ticket.eventDateTime).toLocaleString()}</p>
              <p><strong>Price:</strong> ${ticket.price}</p>
              {ticket.status && <p><strong>Status:</strong> {ticket.status}</p>}
              {user?.role === 'admin' && ticket.userEmail && <p><strong>Posted By:</strong> {ticket.userEmail}</p>}
              {user?.role === 'admin' && ticket.status === 'in-review' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn-primary" onClick={() => handleApprove(ticket)}>Approve</button>
                  <button className="btn-secondary" onClick={() => { setSelectedTicket(ticket); setRejectModalOpen(true); }}>Reject</button>
                </div>
              )}
              {ticket.filePath && (
                <p style={{ marginTop: '10px' }}>
                  <strong>File:</strong>{' '}
                  <span style={{ color: '#5eead4', cursor: 'pointer' }} 
                   onClick={() => window.open(ticket.filePath!, '_blank')}>View PDF</span>
                </p>
              )}
            </div>
          ))}
         </div>
        }


        {/* Reject Modal */}
        {rejectModalOpen && (
          <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3>Reject Ticket</h3>
              <textarea
                rows={4}
                placeholder="Enter rejection reason"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', marginBottom: '12px' }}
              />
              <button onClick={handleRejectSubmit} className="btn-primary">Submit</button>
              <button onClick={() => setRejectModalOpen(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        {/* Loader */}
        {approving && (
          <div className="loader-overlay">
            <div className="loader">Loading...</div>
          </div>
        )}
      </main>
    </div>
  );
}
