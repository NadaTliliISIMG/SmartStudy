import { useEffect, useState } from 'react';
import { Card, Button, Badge, Tabs, Tab, Form, ListGroup } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaArrowLeft, FaMagic, FaQuestionCircle, FaPlay } from 'react-icons/fa';
import { fetchCourse } from '../features/courses/coursesSlice';
import { fetchCourseSummaries, generateSummary, clearSummaryError } from '../features/summaries/summariesSlice';
import { fetchCourseQuizzes, generateQuiz, clearQuizError } from '../features/quizzes/quizzesSlice';
import PageHeader from '../components/common/PageHeader';
import SummaryCard from '../components/summaries/SummaryCard';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/helpers';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: course, error: courseError } = useSelector((s) => s.courses);
  const summaries = useSelector((s) => s.summaries);
  const quizzes = useSelector((s) => s.quizzes);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);

  useEffect(() => {
    dispatch(fetchCourse(id));
    dispatch(fetchCourseSummaries(id));
    dispatch(fetchCourseQuizzes(id));
  }, [dispatch, id]);

  if (!course || course._id !== id) return courseError ? <ErrorAlert message={courseError} /> : <Loader />;

  // Only one generation at a time (the local model handles one request at a time)
  const busy = summaries.generating || quizzes.generating;

  const handleQuiz = async () => {
    const res = await dispatch(generateQuiz({ courseId: id, numberOfQuestions }));
    if (!res.error) navigate(`/quizzes/${res.payload._id}`);
  };

  return (
    <>
      <PageHeader title={course.title} subtitle={<Badge bg="primary">{course.subject}</Badge>}>
        <Button as={Link} to="/courses" variant="outline-secondary"><FaArrowLeft className="me-1" />Retour</Button>
        <Button as={Link} to={`/courses/${id}/edit`} variant="outline-secondary"><FaEdit className="me-1" />Modifier</Button>
      </PageHeader>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <Button disabled={busy} onClick={() => dispatch(generateSummary(id))}>
              <FaMagic className="me-1" />Generate Summary
            </Button>
            <div className="d-flex gap-2 align-items-center">
              <Form.Select
                size="sm"
                style={{ width: 90 }}
                value={numberOfQuestions}
                disabled={busy}
                onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                aria-label="Nombre de questions"
              >
                {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} Q</option>)}
              </Form.Select>
              <Button variant="success" disabled={busy} onClick={handleQuiz}>
                <FaQuestionCircle className="me-1" />Generate Quiz
              </Button>
            </div>
          </div>
          {busy && <Loader message="Génération en cours, cela peut prendre quelques dizaines de secondes..." />}
          <div className="mt-3">
            <ErrorAlert message={summaries.error} onClose={() => dispatch(clearSummaryError())} />
            <ErrorAlert message={quizzes.error} onClose={() => dispatch(clearQuizError())} />
          </div>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="summaries" className="mb-3">
        <Tab eventKey="summaries" title={`Résumés (${summaries.items.length})`}>
          {summaries.loading ? <Loader />
            : summaries.items.length === 0 ? <div className="text-muted py-3">Aucun résumé généré pour ce cours.</div>
            : summaries.items.map((s) => <SummaryCard key={s._id} summary={s} />)}
        </Tab>
        <Tab eventKey="quizzes" title={`Quiz (${quizzes.items.length})`}>
          {quizzes.items.length === 0 ? (
            <div className="text-muted py-3">Aucun quiz généré pour ce cours.</div>
          ) : (
            <ListGroup>
              {quizzes.items.map((q) => (
                <ListGroup.Item key={q._id} className="d-flex justify-content-between align-items-center">
                  <span>
                    {q.questions.length} questions <span className="text-muted small">· {formatDate(q.createdAt)}</span>
                  </span>
                  <Button as={Link} to={`/quizzes/${q._id}`} size="sm"><FaPlay className="me-1" />Passer</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
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