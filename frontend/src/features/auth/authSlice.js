import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('user');

// Day 1: state shape and logout only. Login/register thunks are added on Day 2.
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored ? JSON.parse(stored) : null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;