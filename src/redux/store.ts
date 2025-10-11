import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice';
import ticketsReducer from './ticketsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
  },
});

// RootState represents the entire state object
export type RootState = ReturnType<typeof store.getState>;

// Optionally export dispatch type too
export type AppDispatch = typeof store.dispatch;