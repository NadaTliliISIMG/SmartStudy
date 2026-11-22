const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('returns a JSON status for the backend', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body.service).toBe('backend');
  });

  it('returns 404 for an unknown route', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toBe(404);
  });
});