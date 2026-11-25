import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseFormPage from './pages/CourseFormPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import QuizPage from './pages/QuizPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Tableau de bord" day={6} />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/new" element={<CourseFormPage />} />
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/courses/:id/edit" element={<CourseFormPage />} />
          <Route path="/quizzes/:quizId" element={<QuizPage />} />
          <Route path="/history" element={<PlaceholderPage title="Historique" day={6} />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}