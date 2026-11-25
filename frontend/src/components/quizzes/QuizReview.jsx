import { Card, ListGroup, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Final score and correction: correct answer in green, wrong choice in red
export default function QuizReview({ quiz, result }) {
  const percent = Math.round((result.score / result.totalQuestions) * 100);

  return (
    <>
      <Card className="shadow-sm border-0 mb-4 text-center">
        <Card.Body>
          <div className="text-muted">Votre score</div>
          <div className="display-4 fw-bold">{result.score} / {result.totalQuestions}</div>
          <Badge bg={percent >= 50 ? 'success' : 'danger'}>{percent} %</Badge>
        </Card.Body>
      </Card>

      {quiz.questions.map((q, i) => {
        const a = result.answers.find((x) => x.questionIndex === i) || {};
        return (
          <Card key={i} className="shadow-sm border-0 mb-3">
            <Card.Body>
              <h6>
                {a.isCorrect
                  ? <FaCheckCircle className="text-success me-2" />
                  : <FaTimesCircle className="text-danger me-2" />}
                {i + 1}. {q.question}
              </h6>
              <ListGroup variant="flush">
                {q.options.map((opt) => {
                  let variant;
                  if (opt === q.correctAnswer) variant = 'success';
                  else if (opt === a.selected) variant = 'danger';
                  return (
                    <ListGroup.Item key={opt} variant={variant}>
                      {opt}
                      {opt === a.selected && <span className="ms-2 small">(votre réponse)</span>}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              {a.selected === null && <div className="text-muted small mt-2">Aucune réponse donnée.</div>}
            </Card.Body>
          </Card>
        );
      })}
    </>
  );
}