import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addTicket } from '../redux/ticketsSlice';
import { AppDispatch } from '../redux/store';

export default function UploadTicket() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    eventName: '',
    eventDateTime: '',
    venue: '',
    price: '',
  });

  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      let uploadedTicket = null;
      try {
        uploadedTicket = await res.json();
        dispatch(addTicket(uploadedTicket));
      } catch {
        console.log("No JSON returned, continuing...");
      }

      navigate('/home', { state: { showMyTickets: true } });

    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Ticket upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Upload Ticket</h2>

      {loading && (
        <div style={{ fontSize: '18px', marginBottom: '12px', color: 'blue' }}>
          Uploading... Please wait ⏳
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input
          placeholder="Event Name"
          value={form.eventName}
          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          value={form.eventDateTime}
          onChange={(e) => setForm({ ...form, eventDateTime: e.target.value })}
          required
        />
        <input
          placeholder="Venue"
          value={form.venue}
          onChange={(e) => setForm({ ...form, venue: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <label>
          Upload Event Image:
          <input type="file" accept="image/*" onChange={(e) => setEventImageFile(e.target.files?.[0] || null)} required />
        </label>

        <label>
          Upload Ticket PDF:
          <input type="file" accept="application/pdf" onChange={(e) => setTicketFile(e.target.files?.[0] || null)} required />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Uploading...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
}
