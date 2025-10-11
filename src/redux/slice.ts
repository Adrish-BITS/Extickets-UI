import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of a user (Google or Admin)
export interface User {
  name: string;
  email: string;
  picture?: string;
  isGoogle?: boolean;
  role?: 'user' | 'admin'; // Added role to distinguish admin from normal users
}

export interface AuthState {
  user: User | null;
  users: User[];              // Optional: can store known users
  loginError: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  user: null,
  users: [],
  loginError: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login with Google
    loginWithGoogle: (state, action: PayloadAction<User>) => {
      const existingUser = state.users.find(u => u.email === action.payload.email);
      if (!existingUser) {
        state.users.push(action.payload); // Optional: store user
      }
      state.user = { ...action.payload, role: 'user', isGoogle: true };
      state.isLoggedIn = true;
      state.loginError = null;
    },

    // Login as Admin
    loginAdmin: (state, action: PayloadAction<User>) => {
      const existingUser = state.users.find(u => u.email === action.payload.email);
      if (!existingUser) {
        state.users.push(action.payload);
      }
      state.user = { ...action.payload, role: 'admin', isGoogle: false };
      state.isLoggedIn = true;
      state.loginError = null;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.loginError = null;
    },

    // Optional: handle login errors
    setLoginError: (state, action: PayloadAction<string>) => {
      state.loginError = action.payload;
    },
  },
});

export const { loginWithGoogle, loginAdmin, logout, setLoginError } = authSlice.actions;
export default authSlice.reducer;
