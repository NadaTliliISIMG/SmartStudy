import { useEffect, useState } from 'react';
import { Card, Form, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaGraduationCap } from 'react-icons/fa';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiStatus from '../components/common/ApiStatus';

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
    <Container className="auth-wrapper d-flex align-items-center justify-content-center">
      <Card className="shadow border-0 auth-card">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <FaGraduationCap size={40} className="text-primary mb-2" />
            <h1 className="h4">Connexion à Smart Study</h1>
          </div>
          <ErrorAlert message={error} />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control type="email" name="email" required value={form.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control type="password" name="password" required value={form.password} onChange={handleChange} />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Form>
          <div className="text-center mt-3 small">
            Pas de compte ? <Link to="/register">Créer un compte</Link>
          </div>
          <div className="text-center mt-3"><ApiStatus /></div>
        </Card.Body>
      </Card>
    </Container>
  );
}