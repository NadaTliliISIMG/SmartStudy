/**
 * Computes the score of a quiz.
 * questions : [{ question, options[4], correctAnswer }]
 * answers   : [{ questionIndex, selected }]
 * A missing answer, or an answer that is not one of the options, counts as wrong.
 */
const computeScore = (questions, answers = []) => {
  const byIndex = new Map(
    (Array.isArray(answers) ? answers : []).map((a) => [Number(a.questionIndex), a.selected])
  );

  const detailed = questions.map((q, index) => {
    const raw = byIndex.get(index);
    const selected = typeof raw === 'string' && q.options.includes(raw) ? raw : null;
    return {
      questionIndex: index,
      selected,
      isCorrect: selected !== null && selected === q.correctAnswer,
    };
  });

  return {
    score: detailed.filter((a) => a.isCorrect).length,
    totalQuestions: questions.length,
    answers: detailed,
  };
};

module.exports = { computeScore };