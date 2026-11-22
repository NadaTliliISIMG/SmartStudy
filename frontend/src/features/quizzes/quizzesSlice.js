import { createSlice } from '@reduxjs/toolkit';

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState: { items: [], current: null, lastResult: null, results: [], generating: false, loading: false, error: null },
  reducers: {},
});

export default quizzesSlice.reducer;