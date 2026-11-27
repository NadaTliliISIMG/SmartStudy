import { useEffect } from 'react';
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaBook, FaFileAlt, FaQuestionCircle, FaPlus, FaHistory, FaChevronRight,
} from 'react-icons/fa';
import { fetchStats } from '../features/courses/coursesSlice';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';
import { formatDate } from '../utils/helpers';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { stats, loading, error } = useSelector((s) => s.courses);

  useEffect(() => { dispatch(fetchStats()); }, [dispatch]);

  return (
    <>
      <PageHeader title={`Bonjour ${user?.name || ''}`} subtitle="Voici un aperçu de votre activité">
        <Button as={Link} to="/courses/new"><FaPlus className="me-1" />Nouveau cours</Button>
      </PageHeader>
      <ErrorAlert message={error} />

      {loading && !stats ? (
        <Loader />
      ) : (
        <>
          <Row className="g-4 mb-4">
            <Col md={4}><StatCard label="Cours" value={stats?.totalCourses} icon={FaBook} /></Col>
            <Col md={4}><StatCard label="Résumés générés" value={stats?.totalSummaries} icon={FaFileAlt} variant="success" /></Col>
            <Col md={4}><StatCard label="Quiz générés" value={stats?.totalQuizzes} icon={FaQuestionCircle} variant="warning" /></Col>
          </Row>

          <Row className="g-4">
            <Col lg={8}>
              <Card className="border-0 h-100">
                <Card.Header className="bg-white fw-semibold px-4 py-3">Cours récents</Card.Header>
                <Card.Body className="p-3">
                  {stats?.recentCourses?.length ? (
                    <ListGroup className="quiz-list">
                      {stats.recentCourses.map((c) => (
                        <ListGroup.Item
                          action
                          as={Link}
                          to={`/courses/${c._id}`}
                          key={c._id}
                          className="d-flex justify-content-between align-items-center gap-3"
                        >
                          <span className="d-flex align-items-center gap-3 min-w-0">
                            <span className="icon-tile"><FaBook /></span>
                            <span>
                              <span className="fw-semibold d-block">{c.title}</span>
                              <span className="course-meta">{c.subject} · {formatDate(c.createdAt)}</span>
                            </span>
                          </span>
                          <FaChevronRight className="text-muted flex-shrink-0" />
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="empty-inline">Aucun cours pour le moment.</div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="ai-panel border-0 h-100">
                <Card.Body className="p-4">
                  <div className="fw-semibold mb-3">Actions rapides</div>
                  <div className="d-grid gap-2">
                    <Button as={Link} to="/courses/new"><FaPlus className="me-1" />Ajouter un cours</Button>
                    <Button as={Link} to="/courses" variant="outline-secondary"><FaBook className="me-1" />Voir mes cours</Button>
                    <Button as={Link} to="/history" variant="outline-secondary"><FaHistory className="me-1" />Historique</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
