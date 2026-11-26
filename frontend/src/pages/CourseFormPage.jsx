import { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourse, createCourse, updateCourse, clearCourseError } from '../features/courses/coursesSlice';
import PageHeader from '../components/common/PageHeader';
import CourseForm from '../components/courses/CourseForm';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';

// Used for both /courses/new (create) and /courses/:id/edit (edit)
export default function CourseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, loading, error } = useSelector((s) => s.courses);

  useEffect(() => {
    dispatch(clearCourseError());
    if (isEdit) dispatch(fetchCourse(id));
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (data) => {
    const action = isEdit ? updateCourse({ id, ...data }) : createCourse(data);
    const res = await dispatch(action);
    if (!res.error) navigate(`/courses/${res.payload._id}`);
  };

  // Wait for the right course (ignores a stale course left in the store)
  if (isEdit && current?._id !== id) return error ? <ErrorAlert message={error} /> : <Loader />;

  return (
    <>
      <PageHeader title={isEdit ? 'Modifier le cours' : 'Nouveau cours'} />
      <ErrorAlert message={error} />
      <Card className="border-0" style={{ maxWidth: 860 }}>
        <Card.Body className="p-4">
          <CourseForm
            key={isEdit ? current._id : 'new'}
            initial={isEdit ? current : {}}
            submitLabel={isEdit ? 'Enregistrer' : 'Créer le cours'}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        </Card.Body>
      </Card>
    </>
  );
}