import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaBook, FaRegCalendarAlt } from 'react-icons/fa';
import { formatDate } from '../../utils/helpers';

export default function CourseCard({ course, onDelete }) {
  return (
    <Card className="course-card h-100 border-0">
      <Card.Body className="d-flex flex-column p-4">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <span className="icon-tile"><FaBook /></span>
          <Badge bg="primary" className="subject-badge">{course.subject}</Badge>
        </div>
        <Card.Title className="course-title">{course.title}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {course.content.slice(0, 120)}{course.content.length > 120 ? '…' : ''}
        </Card.Text>
        <div className="course-meta mb-3">
          <FaRegCalendarAlt className="me-2" />Ajouté le {formatDate(course.createdAt)}
        </div>
        <div className="d-flex gap-2">
          <Button as={Link} to={`/courses/${course._id}`} size="sm" variant="primary" className="flex-grow-1">
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
