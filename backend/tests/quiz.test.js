const request = require('supertest');
const jwt = require('jsonwebtoken');

// Models and the AI client are mocked: no MongoDB and no AI service needed.
jest.mock('../models/User', () => ({ findById: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Course', () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Summary', () => ({ create: jest.fn(), find: jest.fn(), deleteMany: jest.fn() }));
jest.mock('../models/Quiz', () => ({ create: jest.fn(), find: jest.fn(), findOne: jest.fn(), deleteMany: jest.fn() }));
jest.mock('../models/QuizResult', () => ({ create: jest.fn(), find: jest.fn(), deleteMany: jest.fn() }));
jest.mock('../services/aiClient', () => ({ summarize: jest.fn(), generateQuiz: jest.fn() }));

const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const aiClient = require('../services/aiClient');
const ApiError = require('../utils/ApiError');
const app = require('../app');
const { jwtSecret } = require('../config/env');

const USER_ID = '64b7f0f0f0f0f0f0f0f0f0f0';
const COURSE_ID = '64b7f0f0f0f0f0f0f0f0f0f1';
const QUIZ_ID = '64b7f0f0f0f0f0f0f0f0f0f2';
const auth = { Authorization: `Bearer ${jwt.sign({ id: USER_ID }, jwtSecret, { expiresIn: '1h' })}` };

const course = { _id: COURSE_ID, userId: USER_ID, content: 'Course text '.repeat(10) };
const questions = [
  { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correctAnswer: 'B' },
  { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correctAnswer: 'D' },
];
const quiz = { _id: QUIZ_ID, userId: USER_ID, courseId: COURSE_ID, questions };

beforeEach(() => {
  jest.resetAllMocks();
  User.findById.mockResolvedValue({ _id: USER_ID });
});

describe('POST /api/courses/:id/quiz', () => {
  it('generates, saves and returns a quiz (201)', async () => {
    Course.findOne.mockResolvedValue(course);
    aiClient.generateQuiz.mockResolvedValue(questions);
    Quiz.create.mockResolvedValue(quiz);

    const res = await request(app).post(`/api/courses/${COURSE_ID}/quiz`).set(auth).send({ numberOfQuestions: 3 });

    expect(res.statusCode).toBe(201);
    expect(aiClient.generateQuiz).toHaveBeenCalledWith(course.content, 3);
    expect(Quiz.create).toHaveBeenCalledWith({ userId: USER_ID, courseId: COURSE_ID, questions });
  });
  it('defaults to 5 questions', async () => {
    Course.findOne.mockResolvedValue(course);
    aiClient.generateQuiz.mockResolvedValue(questions);
    Quiz.create.mockResolvedValue(quiz);
    await request(app).post(`/api/courses/${COURSE_ID}/quiz`).set(auth).send({});
    expect(aiClient.generateQuiz).toHaveBeenCalledWith(course.content, 5);
  });

  it('validates numberOfQuestions (400) without calling the AI', async () => {
    for (const bad of [0, 50, 'abc']) {
      const res = await request(app).post(`/api/courses/${COURSE_ID}/quiz`).set(auth).send({ numberOfQuestions: bad });
      expect(res.statusCode).toBe(400);
    }
    expect(aiClient.generateQuiz).not.toHaveBeenCalled();
  });

  it("returns 404 for a course the user does not own, without calling the AI", async () => {
    Course.findOne.mockResolvedValue(null);
    const res = await request(app).post(`/api/courses/${COURSE_ID}/quiz`).set(auth).send({});
    expect(res.statusCode).toBe(404);
    expect(aiClient.generateQuiz).not.toHaveBeenCalled();
  });
  it('forwards an AI failure (502) and saves nothing', async () => {
    Course.findOne.mockResolvedValue(course);
    aiClient.generateQuiz.mockRejectedValue(new ApiError(502, 'AI service unreachable'));
    const res = await request(app).post(`/api/courses/${COURSE_ID}/quiz`).set(auth).send({});
    expect(res.statusCode).toBe(502);
    expect(Quiz.create).not.toHaveBeenCalled();
  });
});

describe('Quiz reading routes', () => {
  it('lists the quizzes of a course', async () => {
    Course.findOne.mockResolvedValue(course);
    Quiz.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([quiz]) });
    const res = await request(app).get(`/api/courses/${COURSE_ID}/quizzes`).set(auth);
    expect(res.statusCode).toBe(200);
    expect(Quiz.find).toHaveBeenCalledWith({ userId: USER_ID, courseId: COURSE_ID });
  });

  it('lists the quiz history of the user', async () => {
    Quiz.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([quiz]) }) });
    const res = await request(app).get('/api/quizzes').set(auth);
    expect(res.statusCode).toBe(200);
    expect(Quiz.find).toHaveBeenCalledWith({ userId: USER_ID });
  });
  it('returns an owned quiz', async () => {
    Quiz.findOne.mockResolvedValue(quiz);
    const res = await request(app).get(`/api/quizzes/${QUIZ_ID}`).set(auth);
    expect(res.statusCode).toBe(200);
    expect(Quiz.findOne).toHaveBeenCalledWith({ _id: QUIZ_ID, userId: USER_ID });
  });

  it("returns 404 for another user's quiz and for an invalid id", async () => {
    Quiz.findOne.mockResolvedValue(null);
    expect((await request(app).get(`/api/quizzes/${QUIZ_ID}`).set(auth)).statusCode).toBe(404);
    expect((await request(app).get('/api/quizzes/not-an-id').set(auth)).statusCode).toBe(404);
  });
});

describe('POST /api/quizzes/:quizId/submit', () => {
  it('computes the score on the server and saves the result (201)', async () => {
    Quiz.findOne.mockResolvedValue(quiz);
    QuizResult.create.mockImplementation(async (doc) => ({ _id: 'r1', ...doc }));

    const res = await request(app)
      .post(`/api/quizzes/${QUIZ_ID}/submit`)
      .set(auth)
      .send({ answers: [{ questionIndex: 0, selected: 'B' }, { questionIndex: 1, selected: 'A' }], score: 99 });
      expect(res.statusCode).toBe(201);
    // The client-sent "score: 99" is ignored: only 1 answer out of 2 is correct
    expect(res.body.score).toBe(1);
    expect(res.body.totalQuestions).toBe(2);
    expect(QuizResult.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID, quizId: QUIZ_ID, courseId: COURSE_ID, score: 1, totalQuestions: 2 })
    );
    expect(res.body.answers[0]).toEqual({ questionIndex: 0, selected: 'B', isCorrect: true });
  });

  it('rejects a body without an answers array (400)', async () => {
    const res = await request(app).post(`/api/quizzes/${QUIZ_ID}/submit`).set(auth).send({ answers: 'x' });
    expect(res.statusCode).toBe(400);
    expect(QuizResult.create).not.toHaveBeenCalled();
  });

  it("returns 404 for another user's quiz", async () => {
    Quiz.findOne.mockResolvedValue(null);
    const res = await request(app).post(`/api/quizzes/${QUIZ_ID}/submit`).set(auth).send({ answers: [] });
    expect(res.statusCode).toBe(404);
  });
}); 
describe('Results routes', () => {
  it('lists the results of one quiz', async () => {
    Quiz.findOne.mockResolvedValue(quiz);
    QuizResult.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ score: 1 }]) });
    const res = await request(app).get(`/api/quizzes/${QUIZ_ID}/results`).set(auth);
    expect(res.statusCode).toBe(200);
    expect(QuizResult.find).toHaveBeenCalledWith({ userId: USER_ID, quizId: QUIZ_ID });
  });

  it('lists all the scores of the user', async () => {
    QuizResult.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([{ score: 1 }]) }) });
    const res = await request(app).get('/api/results').set(auth);
    expect(res.statusCode).toBe(200);
    expect(QuizResult.find).toHaveBeenCalledWith({ userId: USER_ID });
  });

  it('requires authentication', async () => {
    expect((await request(app).get('/api/results')).statusCode).toBe(401);
  });
});