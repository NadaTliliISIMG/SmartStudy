import { useEffect } from 'react';
import { Card, Tabs, Tab, Table, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBook, FaChevronRight, FaPlay } from 'react-icons/fa';
import { fetchCourses } from '../features/courses/coursesSlice';
import { fetchAllSummaries } from '../features/summaries/summariesSlice';
import { fetchAllQuizzes, fetchAllResults } from '../features/quizzes/quizzesSlice';
import PageHeader from '../components/common/PageHeader';
import SummaryCard from '../components/summaries/SummaryCard';
import { formatDate } from '../utils/helpers';

export default function HistoryPage() {
  const dispatch = useDispatch();
  const courses = useSelector((s) => s.courses.items);
  const summaries = useSelector((s) => s.summaries.items);
  const { items: quizzes, results } = useSelector((s) => s.quizzes);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchAllSummaries());
    dispatch(fetchAllQuizzes());
    dispatch(fetchAllResults());
  }, [dispatch]);

  const empty = (text) => <div className="empty-inline">{text}</div>;
  const average = results.length
    ? Math.round((results.reduce((sum, r) => sum + r.score / r.totalQuestions, 0) / results.length) * 100)
    : null;

  return (
    <>
      <PageHeader title="Historique" subtitle="Cours, résumés, quiz et scores" />

      <Tabs defaultActiveKey="courses" variant="pills" className="ss-tabs mb-4">
        <Tab eventKey="courses" title={`Cours (${courses.length})`}>
          {courses.length === 0 ? empty('Aucun cours.') : (
            <ListGroup className="quiz-list">
              {courses.map((c) => (
                <ListGroup.Item
                  action
                  as={Link}
                  to={`/courses/${c._id}`}
                  key={c._id}
                  className="d-flex justify-content-between align-items-center gap-3"
                >
                  <span className="d-flex align-items-center gap-3">
                    <span className="icon-tile"><FaBook /></span>
                    <span>
                      <span className="fw-semibold d-block">{c.title}</span>
                      <span className="course-meta">{formatDate(c.createdAt)}</span>
                    </span>
                  </span>
                  <span className="d-flex align-items-center gap-3">
                    <span className="badge subject-badge">{c.subject}</span>
                    <FaChevronRight className="text-muted flex-shrink-0" />
                  </span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        <Tab eventKey="summaries" title={`Résumés (${summaries.length})`}>
          {summaries.length === 0 ? empty('Aucun résumé.')
            : summaries.map((s) => <SummaryCard key={s._id} summary={s} showCourse />)}
        </Tab>

        <Tab eventKey="quizzes" title={`Quiz (${quizzes.length})`}>
          {quizzes.length === 0 ? empty('Aucun quiz.') : (
            <ListGroup className="quiz-list">
              {quizzes.map((q) => (
                <ListGroup.Item key={q._id} className="d-flex justify-content-between align-items-center gap-3">
                  <span>
                    <span className="fw-semibold d-block">{q.courseId?.title || 'Cours supprimé'}</span>
                    <span className="course-meta">{q.questions.length} questions · {formatDate(q.createdAt)}</span>
                  </span>
                  <Button as={Link} to={`/quizzes/${q._id}`} size="sm"><FaPlay className="me-1" />Passer</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>

        <Tab eventKey="scores" title={`Scores (${results.length})`}>
          {results.length === 0 ? empty('Aucun score enregistré.') : (
            <>
              <div className="text-muted small mb-3">Moyenne de vos scores : <strong>{average} %</strong></div>
              <Card className="border-0 overflow-hidden">
                <Table responsive hover className="history-table mb-0">
                  <thead>
                    <tr><th>Date</th><th>Cours</th><th className="text-end">Score</th></tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const good = r.score / r.totalQuestions >= 0.5;
                      return (
                        <tr key={r._id}>
                          <td>{formatDate(r.createdAt)}</td>
                          <td className="fw-semibold">{r.courseId?.title || '-'}</td>
                          <td className="text-end">
                            <span className={`score-pill ${good ? 'is-good' : 'is-bad'}`}>{r.score} / {r.totalQuestions}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card>
            </>
          )}
        </Tab>
      </Tabs>
    </>
  );
}
