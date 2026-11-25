import { Card } from 'react-bootstrap';
import { formatDate } from '../../utils/helpers';

export default function SummaryCard({ summary, showCourse = false }) {
  return (
    <Card className="shadow-sm border-0 mb-3">
      <Card.Header className="bg-white d-flex justify-content-between">
        <strong>{showCourse && summary.courseId?.title ? summary.courseId.title : 'Résumé'}</strong>
        <span className="text-muted small">{formatDate(summary.createdAt)}</span>
      </Card.Header>
      <Card.Body style={{ whiteSpace: 'pre-wrap' }}>{summary.content}</Card.Body>
    </Card>
  );
}