import { Card } from 'react-bootstrap';
import { FaRocket } from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';

export default function PlaceholderPage({ title, day }) {
  return (
    <>
      <PageHeader title={title} />
      <Card className="shadow-sm border-0">
        <Card.Body className="text-muted text-center py-5">
          <span className="icon-tile icon-tile-lg mb-3"><FaRocket /></span>
          <div>Cette page sera développée au jour {day}.</div>
        </Card.Body>
      </Card>
    </>
  );
}
