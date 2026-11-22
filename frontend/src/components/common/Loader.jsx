import { Spinner } from 'react-bootstrap';

export default function Loader({ message = 'Chargement...' }) {
  return (
    <div className="text-center py-5 text-muted">
      <Spinner animation="border" role="status" className="mb-2" />
      <div>{message}</div>
    </div>
  );
}