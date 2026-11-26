import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../features/auth/authSlice';
import ErrorAlert from '../components/common/ErrorAlert';
import AuthShell from '../components/layout/AuthShell';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => { if (token) navigate('/dashboard', { replace: true }); }, [token, navigate]);
  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Rejoignez Smart Study et révisez plus intelligemment."
      footer={
        <div className="text-center mt-4 small text-muted">
          Déjà inscrit ? <Link to="/login" className="fw-semibold">Se connecter</Link>
        </div>
      }
    >
      <ErrorAlert message={error} />
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nom</Form.Label>
          <Form.Control name="name" placeholder="Votre nom" required value={form.name} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>E-mail</Form.Label>
          <Form.Control type="email" name="email" placeholder="vous@exemple.com" required value={form.email} onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Mot de passe (6 caractères minimum)</Form.Label>
          <Form.Control type="password" name="password" placeholder="••••••••" minLength={6} required value={form.password} onChange={handleChange} />
        </Form.Group>
        <Button type="submit" size="lg" className="w-100" disabled={loading}>
          {loading ? 'Création...' : "S'inscrire"}
        </Button>
      </Form>
    </AuthShell>
  );
}
