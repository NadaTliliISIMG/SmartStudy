import { createSlice } from '@reduxjs/toolkit';

const coursesSlice = createSlice({
  name: 'courses',
  initialState: { items: [], current: null, loading: false, error: null },
  reducers: {},
});

export default coursesSlice.reducer;