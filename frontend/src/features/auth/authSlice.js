import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { errorMessage } from '../../utils/helpers';

const stored = localStorage.getItem('user');

// Persists the session so a page refresh keeps the user logged in
const persist = ({ user, token }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    persist(res.data);
    return res.data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    persist(res.data);
    return res.data;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

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
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const fulfilled = (state, { payload }) => {
      state.loading = false;
      state.user = payload.user;
      state.token = payload.token;
    };
    const rejected = (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    };
    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, fulfilled)
      .addCase(registerUser.rejected, rejected)
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected);
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;