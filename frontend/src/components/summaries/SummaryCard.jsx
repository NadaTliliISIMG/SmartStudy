import { Card } from 'react-bootstrap';
import { FaMagic } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

export default function SummaryCard({ summary, showCourse = false }) {
  return (
    <Card className="summary-card shadow-sm border-0 mb-3">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <strong>
          <FaMagic className="me-2 text-primary" />
          {showCourse && summary.courseId?.title ? summary.courseId.title : 'Résumé'}
        </strong>
        <span className="text-muted small">{formatDate(summary.createdAt)}</span>
      </Card.Header>
      <Card.Body style={{ whiteSpace: 'pre-wrap' }}>{summary.content}</Card.Body>
    </Card>
  );
}
