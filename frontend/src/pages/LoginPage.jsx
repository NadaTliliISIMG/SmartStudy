import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiStatus from '../components/common/ApiStatus';
import AuthShell from '../components/layout/AuthShell';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  // Already logged in: go straight to the dashboard
  useEffect(() => { if (token) navigate('/dashboard', { replace: true }); }, [token, navigate]);
  // Clear a previous error when leaving the page
  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <AuthShell
      title="Connexion à Smart Study"
      subtitle="Content de vous revoir ! Connectez-vous pour continuer à réviser."
      footer={
        <>
          <div className="text-center mt-4 small text-muted">
            Pas de compte ? <Link to="/register" className="fw-semibold">Créer un compte</Link>
          </div>
          <div className="text-center mt-3"><ApiStatus /></div>
        </>
      }
    >
      <ErrorAlert message={error} />
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>E-mail</Form.Label>
          <Form.Control type="email" name="email" placeholder="vous@exemple.com" required value={form.email} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Mot de passe</Form.Label>
          <Form.Control type="password" name="password" placeholder="••••••••" required value={form.password} onChange={handleChange} />
        </Form.Group>
        <Button type="submit" size="lg" className="w-100" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </Form>
    </AuthShell>
  );
}
