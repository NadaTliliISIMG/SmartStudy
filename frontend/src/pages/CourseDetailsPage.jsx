import { useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import { fetchCourse } from '../features/courses/coursesSlice';
import PageHeader from '../components/common/PageHeader';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/helpers';

// Day 3: course information and content.
// Day 4 adds "Generate Summary"; Day 5 adds "Generate Quiz".
export default function CourseDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: course, error } = useSelector((s) => s.courses);

  useEffect(() => { dispatch(fetchCourse(id)); }, [dispatch, id]);

  if (!course || course._id !== id) return error ? <ErrorAlert message={error} /> : <Loader />;

  return (
    <>
      <PageHeader title={course.title} subtitle={<Badge bg="primary">{course.subject}</Badge>}>
        <Button as={Link} to="/courses" variant="outline-secondary"><FaArrowLeft className="me-1" />Retour</Button>
        <Button as={Link} to={`/courses/${id}/edit`}><FaEdit className="me-1" />Modifier</Button>
      </PageHeader>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white text-muted small">
          Ajouté le {formatDate(course.createdAt)} · Modifié le {formatDate(course.updatedAt)}
        </Card.Header>
        <Card.Body style={{ whiteSpace: 'pre-wrap' }}>{course.content}</Card.Body>
      </Card>
    </>
  );
}