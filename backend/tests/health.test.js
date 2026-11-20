const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('répond avec un statut JSON', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body.service).toBe('backend');
  });
});
