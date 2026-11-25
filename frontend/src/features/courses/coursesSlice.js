import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { errorMessage } from '../../utils/helpers';

// Small helper: wraps an async function and returns the API error message on failure
const thunk = (name, fn) =>
  createAsyncThunk(name, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  });

export const fetchCourses = thunk('courses/fetchAll', async () => (await api.get('/courses')).data);
export const fetchCourse = thunk('courses/fetchOne', async (id) => (await api.get(`/courses/${id}`)).data);
export const createCourse = thunk('courses/create', async (data) => (await api.post('/courses', data)).data);
export const updateCourse = thunk('courses/update', async ({ id, ...data }) => (await api.put(`/courses/${id}`, data)).data);
export const deleteCourse = thunk('courses/delete', async (id) => {
  await api.delete(`/courses/${id}`);
  return id;
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState: { items: [], current: null, loading: false, error: null },
  reducers: {
    clearCourseError: (s) => { s.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.fulfilled, (s, { payload }) => { s.items = payload; })
      .addCase(fetchCourse.pending, (s) => { s.current = null; })
      .addCase(fetchCourse.fulfilled, (s, { payload }) => { s.current = payload; })
      .addCase(createCourse.fulfilled, (s, { payload }) => { s.items.unshift(payload); })
      .addCase(updateCourse.fulfilled, (s, { payload }) => {
        s.current = payload;
        s.items = s.items.map((c) => (c._id === payload._id ? payload : c));
      })
      .addCase(deleteCourse.fulfilled, (s, { payload }) => {
        s.items = s.items.filter((c) => c._id !== payload);
      })
      // Shared loading / error handling for every courses/* action
      .addMatcher((a) => a.type.startsWith('courses/') && a.type.endsWith('/pending'), (s) => {
        s.loading = true;
        s.error = null;
      })
      .addMatcher((a) => a.type.startsWith('courses/') && a.type.endsWith('/fulfilled'), (s) => {
        s.loading = false;
      })
      .addMatcher((a) => a.type.startsWith('courses/') && a.type.endsWith('/rejected'), (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      });
  },
});

export const { clearCourseError } = coursesSlice.actions;
export default coursesSlice.reducer;