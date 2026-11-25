// The HTTP layer (axios) is mocked: no AI service needed.
jest.mock('axios', () => {
  const post = jest.fn();
  return { create: jest.fn(() => ({ post })), __post: post };
});

const axios = require('axios');
const { summarize } = require('../services/aiClient');

const post = axios.__post;
beforeEach(() => post.mockReset());

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