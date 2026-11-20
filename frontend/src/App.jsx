import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaBookOpen } from 'react-icons/fa';

function Home() {
  return (
    <Container className="py-5 text-center">
      <FaBookOpen size={48} className="mb-3" />
      <h1>Smart Study</h1>
      <p className="text-muted">Squelette frontend initialisé (Phase 2).</p>
    </Container>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
