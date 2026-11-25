// The HTTP layer (axios) is mocked: no AI service needed.
jest.mock('axios', () => {
  const post = jest.fn();
  return { create: jest.fn(() => ({ post })), __post: post };
});

const axios = require('axios');
const { summarize, generateQuiz } = require('../services/aiClient');

const post = axios.__post;
beforeEach(() => post.mockReset());

const goodQuestion = (n = 1) => ({
  question: `Question ${n}?`,
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 'B',
});

describe('aiClient.summarize', () => {
  it('returns the summary text', async () => {
    post.mockResolvedValue({ data: { summary: 'Short summary' } });
    await expect(summarize('course')).resolves.toBe('Short summary');
    expect(post).toHaveBeenCalledWith('/api/ai/summarize', { courseContent: 'course' });
  });

  it('maps a timeout to 504', async () => {
    post.mockRejectedValue({ code: 'ECONNABORTED' });
    await expect(summarize('course')).rejects.toMatchObject({ statusCode: 504 });
  });
  it('maps an unreachable service to 502', async () => {
    post.mockRejectedValue({ code: 'ECONNREFUSED' });
    await expect(summarize('course')).rejects.toMatchObject({ statusCode: 502 });
  });

  it('forwards the AI error detail with status 502', async () => {
    post.mockRejectedValue({ response: { status: 500, data: { detail: 'Model failed' } } });
    await expect(summarize('course')).rejects.toMatchObject({ statusCode: 502, message: 'Model failed' });
  });

  it('rejects an invalid payload with 502', async () => {
    post.mockResolvedValue({ data: { nothing: true } });
    await expect(summarize('course')).rejects.toMatchObject({ statusCode: 502 });
  });
});
describe('aiClient.generateQuiz', () => {
  it('returns the questions and calls the right endpoint', async () => {
    post.mockResolvedValue({ data: { questions: [goodQuestion(1), goodQuestion(2)] } });
    const questions = await generateQuiz('course', 2);
    expect(questions).toHaveLength(2);
    expect(post).toHaveBeenCalledWith('/api/ai/generate-quiz', { courseContent: 'course', numberOfQuestions: 2 });
  });

  it('drops malformed questions but keeps the valid ones', async () => {
    const wrongAnswer = { ...goodQuestion(2), correctAnswer: 'Z' };
    const duplicates = { ...goodQuestion(3), options: ['A', 'A', 'C', 'D'] };
    const threeOptions = { ...goodQuestion(4), options: ['A', 'B', 'C'] };
    post.mockResolvedValue({ data: { questions: [goodQuestion(1), wrongAnswer, duplicates, threeOptions, null] } });
    const questions = await generateQuiz('course', 5);
    expect(questions).toEqual([goodQuestion(1)]);
  });
  
  it('fails with 502 when no question is valid', async () => {
    post.mockResolvedValue({ data: { questions: [{ question: 'x', options: [], correctAnswer: 'y' }] } });
    await expect(generateQuiz('course', 3)).rejects.toMatchObject({ statusCode: 502 });
  });

  it('maps a timeout to 504', async () => {
    post.mockRejectedValue({ code: 'ECONNABORTED' });
    await expect(generateQuiz('course', 3)).rejects.toMatchObject({ statusCode: 504 });
  });
});