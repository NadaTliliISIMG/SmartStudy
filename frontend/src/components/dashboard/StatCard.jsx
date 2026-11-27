import { Card } from 'react-bootstrap';

export default function StatCard({ label, value, icon: Icon, variant = 'primary' }) {
  return (
    <Card className="stat-card border-0 h-100">
      <Card.Body className="d-flex align-items-center gap-3 p-4">
        <span className={`icon-tile icon-tile-${variant}`}><Icon /></span>
        <div>
          <div className="stat-value">{value ?? '-'}</div>
          <div className="stat-label">{label}</div>
        </div>
      </Card.Body>
    </Card>
  );
}
