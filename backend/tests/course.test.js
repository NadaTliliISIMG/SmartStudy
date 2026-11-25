const request = require('supertest');
const jwt = require('jsonwebtoken');

// All models are mocked: these tests do not need a running MongoDB.
jest.mock('../models/User', () => ({ findById: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Course', () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Summary', () => ({ deleteMany: jest.fn() }));
jest.mock('../models/Quiz', () => ({ deleteMany: jest.fn() }));
jest.mock('../models/QuizResult', () => ({ deleteMany: jest.fn() }));

const User = require('../models/User');
const Course = require('../models/Course');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const app = require('../app');
const { jwtSecret } = require('../config/env');

const USER_ID = '64b7f0f0f0f0f0f0f0f0f0f0';
const COURSE_ID = '64b7f0f0f0f0f0f0f0f0f0f1';
const token = jwt.sign({ id: USER_ID }, jwtSecret, { expiresIn: '1h' });
const auth = { Authorization: `Bearer ${token}` };
const validBody = {
  title: 'HTTP basics',
  subject: 'Networks',
  content: 'HTTP is an application layer protocol used by the web to exchange hypertext documents.',
};

const fakeCourse = (extra = {}) => ({
  _id: COURSE_ID,
  userId: USER_ID,
  ...validBody,
  save: jest.fn().mockResolvedValue(),
  deleteOne: jest.fn().mockResolvedValue(),
  ...extra,
});

beforeEach(() => {
  jest.resetAllMocks();
  User.findById.mockResolvedValue({ _id: USER_ID }); // authenticated user
});

describe('Course routes: authentication', () => {
  it('rejects requests without token (401)', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/courses', () => {
    it('lists only the courses of the current user', async () => {
    Course.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([fakeCourse()]) });
    const res = await request(app).get('/api/courses').set(auth);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(Course.find).toHaveBeenCalledWith({ userId: USER_ID });
  });
});

describe('POST /api/courses', () => {
  it('creates a course owned by the current user (201)', async () => {
    Course.create.mockResolvedValue(fakeCourse());
    const res = await request(app).post('/api/courses').set(auth).send(validBody);
    expect(res.statusCode).toBe(201);
    expect(Course.create).toHaveBeenCalledWith(expect.objectContaining({ userId: USER_ID, title: 'HTTP basics' }));
  });

  it('validates the body (400)', async () => {
    const res = await request(app).post('/api/courses').set(auth).send({ ...validBody, content: 'too short' });
    expect(res.statusCode).toBe(400);
    expect(Course.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/courses/:id', () => {
  it('returns an owned course (200)', async () => {
    Course.findOne.mockResolvedValue(fakeCourse());
    const res = await request(app).get(`/api/courses/${COURSE_ID}`).set(auth);
    expect(res.statusCode).toBe(200);
    expect(Course.findOne).toHaveBeenCalledWith({ _id: COURSE_ID, userId: USER_ID });
    });

  it("returns 404 for another user's course", async () => {
    Course.findOne.mockResolvedValue(null);
    const res = await request(app).get(`/api/courses/${COURSE_ID}`).set(auth);
    expect(res.statusCode).toBe(404);
  });

  it('returns 404 for an invalid id without querying the database', async () => {
    const res = await request(app).get('/api/courses/not-an-id').set(auth);
    expect(res.statusCode).toBe(404);
    expect(Course.findOne).not.toHaveBeenCalled();
  });
});

describe('PUT /api/courses/:id', () => {
  it('updates an owned course (200)', async () => {
    const doc = fakeCourse();
    Course.findOne.mockResolvedValue(doc);
    const res = await request(app)
      .put(`/api/courses/${COURSE_ID}`)
      .set(auth)
      .send({ ...validBody, title: 'HTTP advanced' });
    expect(res.statusCode).toBe(200);
    expect(doc.title).toBe('HTTP advanced');
    expect(doc.save).toHaveBeenCalled();
  });
});
describe('DELETE /api/courses/:id', () => {
  it('deletes the course and cascades to summaries, quizzes and results', async () => {
    const doc = fakeCourse();
    Course.findOne.mockResolvedValue(doc);
    [Summary, Quiz, QuizResult].forEach((m) => m.deleteMany.mockResolvedValue({}));
    const res = await request(app).delete(`/api/courses/${COURSE_ID}`).set(auth);
    expect(res.statusCode).toBe(200);
    [Summary, Quiz, QuizResult].forEach((m) =>
      expect(m.deleteMany).toHaveBeenCalledWith({ courseId: COURSE_ID })
    );
    expect(doc.deleteOne).toHaveBeenCalled();
  });
});