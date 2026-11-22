import { createSlice } from '@reduxjs/toolkit';

const summariesSlice = createSlice({
  name: 'summaries',
  initialState: { items: [], generating: false, loading: false, error: null },
  reducers: {},
});

export default summariesSlice.reducer;