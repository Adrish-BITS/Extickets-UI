import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slice';
import { RootState } from '../redux/store';

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

  const [activeTab, setActiveTab] = useState<'approved' | 'mytickets'>('approved');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ type: 'image' | 'pdf'; url: string } | null>(null);
  const [approving, setApproving] = useState(false);

  const idToken = localStorage.getItem('token');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchTickets = async () => {
    if (!idToken || !user) return;
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (user.role === 'admin') {
        url = 'http://localhost:8080/api/admin/tickets/status/in-review';
      } else {
        url = activeTab === 'approved'
          ? 'http://localhost:8080/api/admin/tickets/status/approved'
          : `http://localhost:8080/api/tickets/user/${user.email}`;
      }

      const res = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${idToken}` } });
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
    dispatch(logout());
    navigate('/login');
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
        `http://localhost:8084/api/admin/tickets/ticket/${ticket.id}/changeStatus/approved/comments/HI`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error(`Failed to approve ticket (${res.status})`);

      alert('Ticket approved successfully!');
      fetchTickets();
    } catch (err: any) {
      console.error('Failed to approve ticket:', err.message);
      alert('Failed to approve ticket. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome, {user?.name || 'Guest'}</h1>

      <div style={styles.buttons}>
        {user?.role !== 'admin' && (
          <button style={styles.button} onClick={() => navigate('/upload')}>Upload Ticket</button>
        )}
        <button style={styles.button} onClick={() => navigate('/profile')}>Profile</button>
        <button style={{ ...styles.button, backgroundColor: '#dc3545' }} onClick={handleLogout}>Logout</button>
      </div>

      {user?.role !== 'admin' && (
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('approved')}
            style={{ ...styles.tab, backgroundColor: activeTab === 'approved' ? '#007bff' : '#e0e0e0', color: activeTab === 'approved' ? '#fff' : '#000' }}
          >
            Approved Tickets
          </button>
          <button
            onClick={() => setActiveTab('mytickets')}
            style={{ ...styles.tab, backgroundColor: activeTab === 'mytickets' ? '#007bff' : '#e0e0e0', color: activeTab === 'mytickets' ? '#fff' : '#000' }}
          >
            My Tickets
          </button>
        </div>
      )}

      <h2 style={styles.subheading}>
        {user?.role === 'admin' ? 'New Tickets (In-Review)' : activeTab === 'approved' ? 'Approved Tickets' : 'My Tickets'}
      </h2>

      {loading ? (
        <p>Loading tickets...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div style={styles.ticketList}>
          {tickets.map(ticket => (
            <div key={ticket.id} style={styles.ticketCard}>
              <div>
                <h3>{ticket.eventName}</h3>
                <p><strong>Date:</strong> {new Date(ticket.eventDateTime).toLocaleString()}</p>
                <p><strong>Venue:</strong> {ticket.venue}</p>
                <p><strong>Price:</strong> ${ticket.price}</p>
                {ticket.status && <p><strong>Status:</strong> {ticket.status}</p>}
                {user?.role === 'admin' && ticket.userEmail && <p><strong>Posted By:</strong> {ticket.userEmail}</p>}
                {user?.role === 'admin' && ticket.status === 'in-review' && (
                  <button style={styles.approveButton} onClick={() => handleApprove(ticket)}>Approve</button>
                )}
              </div>
              {ticket.eventImagePath && <img src={ticket.eventImagePath} alt={ticket.eventName} style={{ width: '120px', height: '100px', cursor: 'pointer' }} onClick={() => openModal(ticket.eventImagePath!, 'image')} />}
              {ticket.filePath && <p style={{ marginTop: '10px' }}><strong>File:</strong> <span style={{ color: '#007bff', cursor: 'pointer' }} onClick={() => openModal(ticket.filePath!, 'pdf')}>View PDF</span></p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && modalContent && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            {modalContent.type === 'image' ? (
              <img src={modalContent.url} alt="Ticket" style={{ maxWidth: '90vw', maxHeight: '80vh' }} />
            ) : (
              <iframe src={modalContent.url} title="PDF Preview" style={{ width: '90vw', height: '80vh', border: 'none' }} />
            )}
            <button style={styles.modalClose} onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* Full screen loader for approving */}
      {approving && (
        <div style={styles.loaderOverlay}>
          <div style={styles.loader}>Approving ticket...</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' },
  heading: { fontSize: '32px', marginBottom: '20px' },
  buttons: { display: 'flex', gap: '10px', marginBottom: '30px' },
  button: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  approveButton: { padding: '5px 10px', marginTop: '5px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  subheading: { marginTop: '20px', fontSize: '24px', borderBottom: '2px solid #ccc', paddingBottom: '10px' },
  ticketList: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  ticketCard: { display: 'flex', flexDirection: 'column' as const, gap: '10px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fafafa' },
  modalOverlay: { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalContent: { position: 'relative' as const, backgroundColor: '#fff', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute' as const, top: '10px', right: '10px', padding: '5px 10px', cursor: 'pointer' },
  loaderOverlay: { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  loader: { padding: '20px 40px', backgroundColor: '#fff', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' },
};
