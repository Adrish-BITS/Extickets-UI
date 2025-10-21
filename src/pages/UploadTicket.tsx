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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const formData = new FormData();
  
    formData.append('eventName', form.eventName);
    formData.append('eventDateTime', form.eventDateTime);
    formData.append('venue', form.venue);
    formData.append('price', form.price);
  
    if (eventImageFile) formData.append('eventImage', eventImageFile);
    if (ticketFile) formData.append('file', ticketFile);
  
    try {
      const idToken = localStorage.getItem('token'); // send auth token
      const res = await fetch('http://localhost:8080/api/tickets/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
  
      if (!res.ok) throw new Error(`Failed to upload ticket (${res.status})`);
  
      const uploadedTicket = await res.json(); // backend should return the created ticket object
  
      // Optionally, update Redux (so Home sees the new ticket instantly)
      dispatch(addTicket(uploadedTicket));
  
      // Redirect to Home and automatically see in "My Tickets"
      navigate('/home', { state: { showMyTickets: true } });
  
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Ticket upload failed. Please try again.');
    }
  };
  

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Upload Ticket</h2>
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

        {/* Image File Upload */}
        <label>
          Upload Event Image:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEventImageFile(e.target.files?.[0] || null)}
            required
          />
        </label>

        {/* PDF Ticket Upload */}
        <label>
          Upload Ticket PDF:
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
            required
          />
        </label>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white' }}>
          Submit for Approval
        </button>
      </form>
    </div>
  );
}
