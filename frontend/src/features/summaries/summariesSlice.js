import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [], loading: false, error: null };

const summariesSlice = createSlice({
  name: 'summaries',
  initialState,
  reducers: {},
});

export default summariesSlice.reducer;
