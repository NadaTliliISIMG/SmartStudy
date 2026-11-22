import { useEffect, useState } from 'react';
import { Card, Form, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaGraduationCap } from 'react-icons/fa';
import { registerUser, clearAuthError } from '../features/auth/authSlice';
import ErrorAlert from '../components/common/ErrorAlert';

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
    <Container className="auth-wrapper d-flex align-items-center justify-content-center">
      <Card className="shadow border-0 auth-card">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <FaGraduationCap size={40} className="text-primary mb-2" />
            <h1 className="h4">Créer un compte</h1>
          </div>
          <ErrorAlert message={error} />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control name="name" required value={form.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control type="email" name="email" required value={form.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe (6 caractères minimum)</Form.Label>
              <Form.Control type="password" name="password" minLength={6} required value={form.password} onChange={handleChange} />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? 'Création...' : "S'inscrire"}
            </Button>
          </Form>
          <div className="text-center mt-3 small">
            Déjà inscrit ? <Link to="/login">Se connecter</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}