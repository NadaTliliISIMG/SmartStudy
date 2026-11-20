import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [], loading: false, error: null };

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {},
});

export default quizzesSlice.reducer;
