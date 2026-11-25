import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuiz, submitQuiz, resetLastResult } from '../features/quizzes/quizzesSlice';
import PageHeader from '../components/common/PageHeader';
import QuizPlayer from '../components/quizzes/QuizPlayer';
import QuizReview from '../components/quizzes/QuizReview';
import ErrorAlert from '../components/common/ErrorAlert';
import Loader from '../components/common/Loader';

export default function QuizPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const { current: quiz, lastResult, loading, error } = useSelector((s) => s.quizzes);

  useEffect(() => {
    dispatch(resetLastResult());
    dispatch(fetchQuiz(quizId));
  }, [dispatch, quizId]);

  if (!quiz || quiz._id !== quizId) return error ? <ErrorAlert message={error} /> : <Loader />;

  const finished = lastResult && lastResult.quizId === quiz._id;

  return (
    <>
      <PageHeader title="Quiz" subtitle={`${quiz.questions.length} questions`}>
        <Button as={Link} to={`/courses/${quiz.courseId}`} variant="outline-secondary">Retour au cours</Button>
        {finished && <Button onClick={() => dispatch(resetLastResult())}>Recommencer</Button>}
      </PageHeader>
      <ErrorAlert message={error} />
      {finished ? (
        <QuizReview quiz={quiz} result={lastResult} />
      ) : (
        <QuizPlayer
          key={quiz._id + (lastResult ? 'r' : '')}
          quiz={quiz}
          submitting={loading}
          onSubmit={(answers) => dispatch(submitQuiz({ quizId: quiz._id, answers }))}
        />
      )}
    </>
  );
}