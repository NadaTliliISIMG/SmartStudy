const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/User', () => ({ findById: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/Course', () => ({ find: jest.fn(), findOne: jest.fn(), create: jest.fn(), countDocuments: jest.fn() }));
jest.mock('../models/Summary', () => ({ countDocuments: jest.fn(), deleteMany: jest.fn() }));
jest.mock('../models/Quiz', () => ({ countDocuments: jest.fn(), deleteMany: jest.fn() }));
jest.mock('../models/QuizResult', () => ({ deleteMany: jest.fn() }));
jest.mock('../services/aiClient', () => ({ summarize: jest.fn(), generateQuiz: jest.fn() }));

const User = require('../models/User');
const Course = require('../models/Course');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const app = require('../app');
const { jwtSecret } = require('../config/env');

const USER_ID = '64b7f0f0f0f0f0f0f0f0f0f0';
const auth = { Authorization: `Bearer ${jwt.sign({ id: USER_ID }, jwtSecret, { expiresIn: '1h' })}` };
beforeEach(() => {
  jest.resetAllMocks();
  User.findById.mockResolvedValue({ _id: USER_ID });
});

describe('GET /api/dashboard/stats', () => {
  it('returns the totals and the recent courses of the current user only', async () => {
    const recent = [{ _id: 'c1', title: 'HTTP', subject: 'Networks' }];
    Course.countDocuments.mockResolvedValue(4);
    Summary.countDocuments.mockResolvedValue(7);
    Quiz.countDocuments.mockResolvedValue(3);
    const select = jest.fn().mockResolvedValue(recent);
    Course.find.mockReturnValue({ sort: () => ({ limit: () => ({ select }) }) });

    const res = await request(app).get('/api/dashboard/stats').set(auth);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ totalCourses: 4, totalSummaries: 7, totalQuizzes: 3, recentCourses: recent });
    [Course.countDocuments, Summary.countDocuments, Quiz.countDocuments].forEach((fn) =>
      expect(fn).toHaveBeenCalledWith({ userId: USER_ID })
    );
  });

  it('requires authentication', async () => {
    expect((await request(app).get('/api/dashboard/stats')).statusCode).toBe(401);
  });
});