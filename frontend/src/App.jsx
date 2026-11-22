import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Tableau de bord" day={5} />} />
          <Route path="/courses" element={<PlaceholderPage title="Mes cours" day={3} />} />
          <Route path="/history" element={<PlaceholderPage title="Historique" day={5} />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}