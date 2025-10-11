// redux/ticketsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { uploadTicketApi } from '../pages/fakeapi';
import { AppDispatch } from './store';

interface Ticket {
  eventName: string;
  eventDateTime: string;
  venue: string;
  price: number;
  eventImage: string;
  file:string
}

interface TicketsState {
  userTickets: Ticket[];
}

const initialState: TicketsState = {
  userTickets: [],
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.userTickets.push(action.payload);
    },
  },
});

export const { addTicket } = ticketsSlice.actions;

export const uploadTicket = (ticketData: Omit<Ticket, 'id' | 'status'>) => async (dispatch: AppDispatch) => {
    try {
      const response = await uploadTicketApi(ticketData);
      if (response.success) {
        dispatch(
          addTicket({
            ...ticketData,
          })
        );
      }
    } catch (error) {
      console.error('Upload ticket failed:', error);
    }
  };
export default ticketsSlice.reducer;
