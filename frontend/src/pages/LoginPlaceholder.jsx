import { Card, Container } from 'react-bootstrap';
import { FaGraduationCap } from 'react-icons/fa';
import ApiStatus from '../components/common/ApiStatus';

export default function LoginPlaceholder() {
  return (
    <Container className="auth-wrapper d-flex align-items-center justify-content-center">
      <Card className="shadow border-0 auth-card">
        <Card.Body className="p-4 text-center">
          <FaGraduationCap size={40} className="text-primary mb-2" />
          <h1 className="h4">Smart Study</h1>
          <p className="text-muted">Page de connexion (jour 2)</p>
          <ApiStatus />
        </Card.Body>
      </Card>
    </Container>
  );
}