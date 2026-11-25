import { useEffect } from 'react';
import { Card, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaArrowLeft, FaMagic } from 'react-icons/fa';
import { fetchCourse } from '../features/courses/coursesSlice';
import { fetchCourseSummaries, generateSummary, clearSummaryError } from '../features/summaries/summariesSlice';
import PageHeader from '../components/common/PageHeader';
import SummaryCard from '../components/summaries/SummaryCard';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/helpers';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: course, error: courseError } = useSelector((s) => s.courses);
  const summaries = useSelector((s) => s.summaries);

  useEffect(() => {
    dispatch(fetchCourse(id));
    dispatch(fetchCourseSummaries(id));
  }, [dispatch, id]);

  if (!course || course._id !== id) return courseError ? <ErrorAlert message={courseError} /> : <Loader />;

  return (
    <>
      <PageHeader title={course.title} subtitle={<Badge bg="primary">{course.subject}</Badge>}>
        <Button as={Link} to="/courses" variant="outline-secondary"><FaArrowLeft className="me-1" />Retour</Button>
        <Button as={Link} to={`/courses/${id}/edit`} variant="outline-secondary"><FaEdit className="me-1" />Modifier</Button>
      </PageHeader>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Button disabled={summaries.generating} onClick={() => dispatch(generateSummary(id))}>
            <FaMagic className="me-1" />Generate Summary
          </Button>
          {summaries.generating && (
            <Loader message="Génération en cours, cela peut prendre quelques dizaines de secondes..." />
          )}
          <div className="mt-3">
            <ErrorAlert message={summaries.error} onClose={() => dispatch(clearSummaryError())} />
          </div>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="summaries" className="mb-3">
        <Tab eventKey="summaries" title={`Résumés (${summaries.items.length})`}>
          {summaries.loading ? (
            <Loader />
          ) : summaries.items.length === 0 ? (
            <div className="text-muted py-3">Aucun résumé généré pour ce cours.</div>
          ) : (
            summaries.items.map((s) => <SummaryCard key={s._id} summary={s} />)
          )}
        </Tab>
        <Tab eventKey="content" title="Contenu du cours">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white text-muted small">
              Ajouté le {formatDate(course.createdAt)} · Modifié le {formatDate(course.updatedAt)}
            </Card.Header>
            <Card.Body style={{ whiteSpace: 'pre-wrap' }}>{course.content}</Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </>
  );
}