const { computeScore } = require('../utils/scoring');

const questions = [
  { question: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
  { question: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswer: 'D' },
  { question: 'Q3', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' },
];

describe('computeScore', () => {
  it('counts the correct answers', () => {
    const r = computeScore(questions, [
      { questionIndex: 0, selected: 'B' },
      { questionIndex: 1, selected: 'A' },
      { questionIndex: 2, selected: 'A' },
    ]);
    expect(r.score).toBe(2);
    expect(r.totalQuestions).toBe(3);
    expect(r.answers[1].isCorrect).toBe(false);
  });

  it('treats unanswered questions as wrong', () => {
    const r = computeScore(questions, [{ questionIndex: 0, selected: 'B' }]);
    expect(r.score).toBe(1);
    expect(r.answers[2].selected).toBeNull();
  });
  it('ignores an answer that is not one of the options', () => {
    const r = computeScore(questions, [{ questionIndex: 0, selected: 'Z' }]);
    expect(r.score).toBe(0);
    expect(r.answers[0].selected).toBeNull();
  });

  it('handles a missing or malformed answers list', () => {
    expect(computeScore(questions, undefined).score).toBe(0);
    expect(computeScore(questions, 'nope').score).toBe(0);
  });

  it('gives a full score when everything is correct', () => {
    const r = computeScore(questions, [
      { questionIndex: 0, selected: 'B' },
      { questionIndex: 1, selected: 'D' },
      { questionIndex: 2, selected: 'A' },
    ]);
    expect(r.score).toBe(3);
  });
});