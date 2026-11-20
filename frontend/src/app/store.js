import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import coursesReducer from '../features/courses/coursesSlice';
import summariesReducer from '../features/summaries/summariesSlice';
import quizzesReducer from '../features/quizzes/quizzesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    summaries: summariesReducer,
    quizzes: quizzesReducer,
  },
});
