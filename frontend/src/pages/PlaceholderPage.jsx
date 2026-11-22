import { Card } from 'react-bootstrap';
import PageHeader from '../components/common/PageHeader';

export default function PlaceholderPage({ title, day }) {
  return (
    <>
      <PageHeader title={title} />
      <Card className="shadow-sm border-0">
        <Card.Body className="text-muted">Cette page sera développée au jour {day}.</Card.Body>
      </Card>
    </>
  );
}