import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle, loginAdmin } from '../redux/slice'; // Add loginAdmin action
import { RootState } from '../redux/store';

export interface User {
  name: string;
  email: string;
  picture?: string;       // optional, for Google users
  isGoogle?: boolean;     // true if logged in via Google
  role?: 'user' | 'admin'; // 'user' for normal users, 'admin' for admins
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  // Admin login state
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/home');
    }
  }, [isLoggedIn, navigate]);

  // Google OAuth login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return;
    localStorage.setItem('token', idToken);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include',
      });
      const data = await res.json();
      const user = data.user || data;
      if (!user?.email) throw new Error('Invalid user data');
      dispatch(loginWithGoogle(user));
      if (data.token) localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Admin login
  const handleAdminLogin = () => {
    const { username, password } = adminCredentials;
  
    // Replace with your actual admin validation
    if (username === 'admin' && password === 'admin123') {
      const adminUser: User = {
        name: 'Admin',
        email: 'admin@company.com',
        role: 'admin', // TypeScript now knows this is the literal type 'admin'
      };
  
      localStorage.setItem('token', 'admin-token'); // fake token
      dispatch(loginAdmin(adminUser));
      navigate('/home');
    } else {
      setAdminError('Invalid admin credentials');
    }
  };
  

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h2 style={styles.heading}>Sign in with Google</h2>
        {!loading ? (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
            useOneTap
            size="large"
            theme="outline"
            text="signin_with"
          />
        ) : (
          <p>Loading...</p>
        )}

        <hr style={{ margin: '20px 0' }} />

        <h2 style={styles.heading}>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={adminCredentials.username}
          onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={adminCredentials.password}
          onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
          style={styles.input}
        />
        <button onClick={handleAdminLogin} style={styles.button}>Login as Admin</button>
        {adminError && <p style={{ color: 'red' }}>{adminError}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    height: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
  },
  form: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center' as const,
  },
  heading: { marginBottom: '20px', fontWeight: 700, color: '#333' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};
