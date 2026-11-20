import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [], loading: false, error: null };

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
});

export default coursesSlice.reducer;
