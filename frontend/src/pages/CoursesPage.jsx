import { useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import { fetchCourses, deleteCourse, clearCourseError } from '../features/courses/coursesSlice';
import PageHeader from '../components/common/PageHeader';
import CourseCard from '../components/courses/CourseCard';
import ConfirmModal from '../components/common/ConfirmModal';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';

export default function CoursesPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.courses);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => { dispatch(fetchCourses()); }, [dispatch]);

  const confirmDelete = async () => {
    await dispatch(deleteCourse(toDelete._id));
    setToDelete(null);
  };

  return (
    <>
      <PageHeader title="Mes cours" subtitle={`${items.length} cours`}>
        <Button as={Link} to="/courses/new"><FaPlus className="me-1" />Nouveau cours</Button>
      </PageHeader>
      <ErrorAlert message={error} onClose={() => dispatch(clearCourseError())} />
      {loading && !items.length ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="text-center text-muted py-5">
          Aucun cours. Ajoutez votre premier cours pour pouvoir générer un résumé ou un quiz.
        </div>
      ) : (
        <Row className="g-3">
          {items.map((c) => (
            <Col key={c._id} md={6} xl={4}>
              <CourseCard course={c} onDelete={setToDelete} />
            </Col>
          ))}
        </Row>
      )}
      <ConfirmModal
        show={!!toDelete}
        title="Supprimer le cours"
        message={`Supprimer « ${toDelete?.title} » ainsi que ses résumés, quiz et résultats ?`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}