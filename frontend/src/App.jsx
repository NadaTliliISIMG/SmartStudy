import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPlaceholder from './pages/LoginPlaceholder';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="/register" element={<PlaceholderPage title="Inscription" day={2} />} />
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