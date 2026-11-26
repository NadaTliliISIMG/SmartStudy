import { useState } from 'react';
import { Card, Button, ListGroup, ProgressBar } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';

// Shows one question at a time, with navigation. Answers are kept locally until submission.
export default function QuizPlayer({ quiz, submitting, onSubmit }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState({}); // { questionIndex: chosen option }
  const total = quiz.questions.length;
  const q = quiz.questions[index];
  const answered = Object.keys(selected).length;

  const handleSubmit = () =>
    onSubmit(quiz.questions.map((_, i) => ({ questionIndex: i, selected: selected[i] ?? null })));

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4 p-md-5">
        <div className="d-flex justify-content-between text-muted small fw-semibold mb-2">
          <span>Question {index + 1} / {total}</span>
          <span>{answered} répondue(s)</span>
        </div>
        <ProgressBar now={((index + 1) / total) * 100} className="mb-4" />
        <h5 className="quiz-question mb-4">{q.question}</h5>
        <ListGroup className="quiz-options mb-4">
          {q.options.map((opt, i) => (
            <ListGroup.Item
              action
              key={opt}
              active={selected[index] === opt}
              onClick={() => setSelected({ ...selected, [index]: opt })}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="d-flex justify-content-between gap-2">
          <Button variant="outline-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            <FaChevronLeft className="me-1" />Précédente
          </Button>
          {index < total - 1 ? (
            <Button onClick={() => setIndex(index + 1)}>
              Suivante<FaChevronRight className="ms-1" />
            </Button>
          ) : (
            <Button variant="success" disabled={submitting} onClick={handleSubmit}>
              <FaCheck className="me-1" />{submitting ? 'Envoi...' : 'Terminer et voir le score'}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
