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
      <Card.Body>
        <div className="d-flex justify-content-between text-muted small mb-2">
          <span>Question {index + 1} / {total}</span>
          <span>{answered} répondue(s)</span>
        </div>
        <ProgressBar now={((index + 1) / total) * 100} className="mb-4" style={{ height: 6 }} />
        <h5 className="mb-3">{q.question}</h5>
        <ListGroup className="mb-4">
          {q.options.map((opt) => (
            <ListGroup.Item
              action
              key={opt}
              active={selected[index] === opt}
              onClick={() => setSelected({ ...selected, [index]: opt })}
            >
              {opt}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="d-flex justify-content-between">
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