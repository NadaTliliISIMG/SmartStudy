import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { errorMessage } from '../../utils/helpers';

const thunk = (name, fn) =>
  createAsyncThunk(name, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  });

export const fetchCourseSummaries = thunk('summaries/byCourse', async (courseId) =>
  (await api.get(`/courses/${courseId}/summaries`)).data);
export const generateSummary = thunk('summaries/generate', async (courseId) =>
  (await api.post(`/courses/${courseId}/summary`)).data);


const summariesSlice = createSlice({
  name: 'summaries',
  initialState: { items: [], generating: false, loading: false, error: null },
  reducers: {
    clearSummaryError: (s) => { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseSummaries.pending, (s) => { s.loading = true; s.error = null; s.items = []; })
      .addCase(fetchCourseSummaries.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
      .addCase(fetchCourseSummaries.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(generateSummary.pending, (s) => { s.generating = true; s.error = null; })
      .addCase(generateSummary.fulfilled, (s, { payload }) => { s.generating = false; s.items.unshift(payload); })
      .addCase(generateSummary.rejected, (s, { payload }) => { s.generating = false; s.error = payload; });
  },
});

export const { clearSummaryError } = summariesSlice.actions;
export default summariesSlice.reducer;