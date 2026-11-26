import { useEffect, useState } from 'react';
import { Badge } from 'react-bootstrap';
import api from '../../services/api';

export default function ApiStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.status === 'ok' ? 'ok' : 'degraded'))
      .catch(() => setStatus('down'));
  }, []);

  const variant = { checking: 'secondary', ok: 'success', degraded: 'warning', down: 'danger' }[status];
  return <Badge bg={variant} pill className="px-3 py-2">API : {status}</Badge>;
}
