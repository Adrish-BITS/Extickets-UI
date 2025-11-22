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

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('');
  const [filterField, setFilterField] = useState('');
  const [allVenues, setAllVenues] = useState<string[]>([]);

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
      const ticketList = Array.isArray(data) ? data : data.tickets || [];
      setTickets(ticketList);

     // Populate venues for filter dropdown
const venues: string[] = Array.from(
  new Set(ticketList.map(t => t.venue).filter((v): v is string => !!v))
);
setAllVenues(venues);

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

  // Filtered & sorted tickets
  const displayedTickets = tickets
    .filter(ticket => {
      const query = searchQuery.toLowerCase();
      return (
        ticket.eventName.toLowerCase().includes(query) ||
        ticket.venue.toLowerCase().includes(query) ||
        (ticket.userEmail?.toLowerCase().includes(query) ?? false)
      ) && (filterField ? ticket.venue === filterField : true);
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      if (sortField === 'date') return new Date(a.eventDateTime).getTime() - new Date(b.eventDateTime).getTime();
      if (sortField === 'venue') return a.venue.localeCompare(b.venue);
      if (sortField === 'price') return a.price - b.price;
      return 0;
    });

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="nav-header">
        <nav className="nav-container">
          <div className="nav-content">
            <a href="#" className="logo-link">
              <img src={logo} alt="TicketWave Logo" style={{ height: '100px', width: '150px' }} />
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
        {/* Admin Instructions */}
        {user?.role === 'admin' && (
          <div className="admin-instructions">
            <h3>Ticket Approval Guidelines</h3>
            <div className="instructions-box">
              <p><strong>Approve if:</strong></p>
              <ul>
                <li>Event date and time are valid and match the event timeline.</li>
                <li>Ticket image is clear, without blur or cropping. All relevant ticket info should be readable.</li>
                <li>No personal or sensitive information is visible (name, email, booking ID).</li>
                <li>Seat/location details appear genuine and accurate.</li>
              </ul>
              <p><strong>Reject if:</strong></p>
              <ul>
                <li>Ticket appears fake, modified, or altered (mismatched fonts, low-quality edits, inconsistent details).</li>
                <li>Details are incomplete, incorrect, or suspicious (missing seat numbers, improbable pricing, conflicting event timing).</li>
                <li>Image is unclear, cropped, or unreadable (blurry text, glare, incomplete scan).</li>
              </ul>
              <p>When rejecting a ticket, provide a short reason to the seller and suggest corrective steps.</p>
            </div>
          </div>
        )}

        {/* Search, Sort, Filter */}
        <div className="tickets-controls">
          <input
            type="text"
            placeholder="Search by event name, venue, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-box"
          />
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="sort-dropdown"
          >
            <option value="">Sort By</option>
            <option value="date">Date</option>
            <option value="venue">Venue</option>
            <option value="price">Price</option>
          </select>
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="filter-dropdown"
          >
            <option value="">Filter By Venue</option>
            {allVenues.map((venue) => (
              <option key={venue} value={venue}>{venue}</option>
            ))}
          </select>
        </div>

        {loading ? <p>Loading tickets...</p> :
         error ? <p style={{ color: 'red' }}>{error}</p> :
         displayedTickets.length === 0 ? <p>No tickets found.</p> :
         <div className="tickets-grid">
          {displayedTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card">

              {/* LEFT IMAGE */}
              <div className="ticket-image-wrapper">
                {ticket.eventImagePath ? (
                  <img
                    src={ticket.eventImagePath}
                    alt={ticket.eventName}
                    className="ticket-image"
                    onClick={() => openModal(ticket.eventImagePath!, "image")}
                  />
                ) : (
                  <div className="ticket-placeholder">No Image</div>
                )}
              </div>

              {/* RIGHT DETAILS */}
              <div className="ticket-details">
                <h3 className="ticket-title">{ticket.eventName}</h3>
                <p><span>Venue:</span> {ticket.venue}</p>
                <p><span>Date:</span> {new Date(ticket.eventDateTime).toLocaleString()}</p>
                <p><span>Price:</span> ${ticket.price}</p>
                {ticket.status && <p><span>Status:</span> {ticket.status}</p>}
                {user?.role === "admin" && ticket.userEmail && <p><span>Posted By:</span> {ticket.userEmail}</p>}
                {ticket.filePath && (
                  <p className="ticket-pdf">
                    <span>File:</span>{" "}
                    <strong onClick={() => window.open(ticket.filePath!, "_blank")}>View PDF</strong>
                  </p>
                )}
              </div>

              {/* BUTTON COLUMN */}
              {user?.role === "admin" && (
                <div className="ticket-action-cell">
                  <button className="btn-approve" onClick={() => handleApprove(ticket)}>Approve</button>
                  <button
                    className="btn-reject"
                    onClick={() => { setSelectedTicket(ticket); setRejectModalOpen(true); }}
                  >
                    Reject
                  </button>
                </div>
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
