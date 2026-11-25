const request = require('supertest');
const jwt = require('jsonwebtoken');

// Models and the AI client are mocked: no MongoDB and no AI service needed.
jest.mock('../models/User', () => ({ findById: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Course', () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Summary', () => ({ create: jest.fn(), find: jest.fn(), deleteMany: jest.fn() }));
jest.mock('../models/Quiz', () => ({ deleteMany: jest.fn() }));
jest.mock('../models/QuizResult', () => ({ deleteMany: jest.fn() }));
jest.mock('../services/aiClient', () => ({ summarize: jest.fn() }));

const User = require('../models/User');
const Course = require('../models/Course');
const Summary = require('../models/Summary');
const aiClient = require('../services/aiClient');
const ApiError = require('../utils/ApiError');
const app = require('../app');
const { jwtSecret } = require('../config/env');

const USER_ID = '64b7f0f0f0f0f0f0f0f0f0f0';
const COURSE_ID = '64b7f0f0f0f0f0f0f0f0f0f1';
const auth = { Authorization: `Bearer ${jwt.sign({ id: USER_ID }, jwtSecret, { expiresIn: '1h' })}` };
const course = { _id: COURSE_ID, userId: USER_ID, title: 'HTTP', subject: 'Networks', content: 'Course text '.repeat(10) };
const summary = { _id: 'abc', userId: USER_ID, courseId: COURSE_ID, content: 'Generated summary' };

beforeEach(() => {
  jest.resetAllMocks();
  User.findById.mockResolvedValue({ _id: USER_ID });
});

describe('POST /api/courses/:id/summary', () => {
  it('asks the AI service, saves and returns the summary (201)', async () => {
    Course.findOne.mockResolvedValue(course);
    aiClient.summarize.mockResolvedValue('Generated summary');
    Summary.create.mockResolvedValue(summary);

    const res = await request(app).post(`/api/courses/${COURSE_ID}/summary`).set(auth);

    expect(res.statusCode).toBe(201);
    expect(aiClient.summarize).toHaveBeenCalledWith(course.content);
    expect(Summary.create).toHaveBeenCalledWith({ userId: USER_ID, courseId: COURSE_ID, content: 'Generated summary' });
  });
  
  it('returns 404 and never calls the AI for a course the user does not own', async () => {
    Course.findOne.mockResolvedValue(null);
    const res = await request(app).post(`/api/courses/${COURSE_ID}/summary`).set(auth);
    expect(res.statusCode).toBe(404);
    expect(aiClient.summarize).not.toHaveBeenCalled();
  });

  it('forwards an AI failure as 502 and saves nothing', async () => {
    Course.findOne.mockResolvedValue(course);
    aiClient.summarize.mockRejectedValue(new ApiError(502, 'AI service unreachable'));
    const res = await request(app).post(`/api/courses/${COURSE_ID}/summary`).set(auth);
    expect(res.statusCode).toBe(502);
    expect(Summary.create).not.toHaveBeenCalled();
  });

  it('forwards an AI timeout as 504', async () => {
    Course.findOne.mockResolvedValue(course);
    aiClient.summarize.mockRejectedValue(new ApiError(504, 'The AI service took too long to answer'));
    const res = await request(app).post(`/api/courses/${COURSE_ID}/summary`).set(auth);
    expect(res.statusCode).toBe(504);
  });

  it('requires authentication (401)', async () => {
    const res = await request(app).post(`/api/courses/${COURSE_ID}/summary`);
    expect(res.statusCode).toBe(401);
  });
});

describe('GET summaries', () => {
  it('lists the summaries of one course of the user', async () => {
    Course.findOne.mockResolvedValue(course);
    Summary.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([summary]) });
    const res = await request(app).get(`/api/courses/${COURSE_ID}/summaries`).set(auth);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(Summary.find).toHaveBeenCalledWith({ userId: USER_ID, courseId: COURSE_ID });
  });

  it('lists the whole summary history of the user', async () => {
    Summary.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([summary]) }) });
    const res = await request(app).get('/api/summaries').set(auth);
    expect(res.statusCode).toBe(200);
    expect(Summary.find).toHaveBeenCalledWith({ userId: USER_ID });
  });
});