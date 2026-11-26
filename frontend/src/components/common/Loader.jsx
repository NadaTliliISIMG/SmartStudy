import { Spinner } from 'react-bootstrap';

export default function Loader({ message = 'Chargement...' }) {
  return (
    <div className="loader-box text-center py-5">
      <Spinner animation="border" role="status" variant="primary" className="mb-3" />
      <div>{message}</div>
    </div>
  );
}
