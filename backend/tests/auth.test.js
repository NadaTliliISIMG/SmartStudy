const request = require('supertest');
const jwt = require('jsonwebtoken');

// The User model is mocked: these tests do not need a running MongoDB.
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

const User = require('../models/User');
const app = require('../app');
const { jwtSecret } = require('../config/env');

const fakeUser = (overrides = {}) => ({
  _id: '64b7f0f0f0f0f0f0f0f0f0f0',
  name: 'Nada',
  email: 'nada@example.com',
  createdAt: '2026-11-21T10:00:00.000Z',
  matchPassword: jest.fn().mockResolvedValue(true),
  toPublic() {
    return { _id: this._id, name: this.name, email: this.email, createdAt: this.createdAt };
  },
  ...overrides,
});
beforeEach(() => jest.resetAllMocks());

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token (201)', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(fakeUser());
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Nada', email: 'nada@example.com', password: 'secret123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('nada@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects an existing email (409)', async () => {
    User.findOne.mockResolvedValue(fakeUser());
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Nada', email: 'nada@example.com', password: 'secret123' });
    expect(res.statusCode).toBe(409);
  });
  it('validates the body (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'not-an-email', password: '1' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token with valid credentials (200)', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser()) });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nada@example.com', password: 'secret123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects a wrong password (401)', async () => {
    const user = fakeUser({ matchPassword: jest.fn().mockResolvedValue(false) });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nada@example.com', password: 'wrong-password' });
    expect(res.statusCode).toBe(401);
  });
  it('rejects an unknown email (401)', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/auth/me and protected routes', () => {
  it('returns the current user with a valid token (200)', async () => {
    const user = fakeUser();
    User.findById.mockResolvedValue(user);
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('nada@example.com');
  });

  it('rejects a request without token (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('rejects an invalid token (401)', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc');
    expect(res.statusCode).toBe(401);
  });
});