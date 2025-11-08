import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import UploadTicket from './pages/UploadTicket';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from './pages/Dashboard';

const GOOGLE_CLIENT_ID = '464546863135-1991ht6skloqe2dapfj53k61k2cmj0h3.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/upload" element={<UploadTicket />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
