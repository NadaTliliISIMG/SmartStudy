import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

export default function CourseCard({ course, onDelete }) {
  return (
    <Card className="shadow-sm h-100 border-0">
      <Card.Body className="d-flex flex-column">
        <Badge bg="primary" className="align-self-start mb-2">{course.subject}</Badge>
        <Card.Title>{course.title}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {course.content.slice(0, 120)}{course.content.length > 120 ? '…' : ''}
        </Card.Text>
        <div className="text-muted small mb-3">Ajouté le {formatDate(course.createdAt)}</div>
        <div className="d-flex gap-2">
          <Button as={Link} to={`/courses/${course._id}`} size="sm" variant="primary">
            <FaEye className="me-1" />Ouvrir
          </Button>
          <Button as={Link} to={`/courses/${course._id}/edit`} size="sm" variant="outline-secondary">
            <FaEdit className="me-1" />Modifier
          </Button>
          <Button size="sm" variant="outline-danger" onClick={() => onDelete(course)} aria-label="Supprimer">
            <FaTrash />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}