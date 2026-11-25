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

export const fetchCourseQuizzes = thunk('quizzes/byCourse', async (courseId) =>
  (await api.get(`/courses/${courseId}/quizzes`)).data);
export const fetchQuiz = thunk('quizzes/one', async (id) => (await api.get(`/quizzes/${id}`)).data);
export const generateQuiz = thunk('quizzes/generate', async ({ courseId, numberOfQuestions }) =>
  (await api.post(`/courses/${courseId}/quiz`, { numberOfQuestions })).data);
export const submitQuiz = thunk('quizzes/submit', async ({ quizId, answers }) =>
  (await api.post(`/quizzes/${quizId}/submit`, { answers })).data);
// Used by the history page on Day 6
export const fetchAllQuizzes = thunk('quizzes/all', async () => (await api.get('/quizzes')).data);
export const fetchAllResults = thunk('quizzes/results', async () => (await api.get('/results')).data);

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState: {
    items: [], current: null, lastResult: null, results: [],
    generating: false, loading: false, error: null,
  },
  reducers: {
    clearQuizError: (s) => { s.error = null; },
    resetLastResult: (s) => { s.lastResult = null; },
  },
  extraReducers: (builder) => {
    // The two list thunks share the same reducers
    [fetchCourseQuizzes, fetchAllQuizzes].forEach((t) =>
      builder
        .addCase(t.pending, (s) => { s.loading = true; s.error = null; })
        .addCase(t.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
        .addCase(t.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
    );
    builder
      .addCase(fetchQuiz.pending, (s) => { s.loading = true; s.current = null; s.error = null; })
      .addCase(fetchQuiz.fulfilled, (s, { payload }) => { s.loading = false; s.current = payload; })
      .addCase(fetchQuiz.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(generateQuiz.pending, (s) => { s.generating = true; s.error = null; })
      .addCase(generateQuiz.fulfilled, (s, { payload }) => { s.generating = false; s.items.unshift(payload); })
      .addCase(generateQuiz.rejected, (s, { payload }) => { s.generating = false; s.error = payload; })
      .addCase(submitQuiz.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(submitQuiz.fulfilled, (s, { payload }) => { s.loading = false; s.lastResult = payload; })
      .addCase(submitQuiz.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(fetchAllResults.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAllResults.fulfilled, (s, { payload }) => { s.loading = false; s.results = payload; })
      .addCase(fetchAllResults.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const { clearQuizError, resetLastResult } = quizzesSlice.actions;
export default quizzesSlice.reducer;