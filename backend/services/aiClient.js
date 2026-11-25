const axios = require('axios');
const { aiServiceUrl, aiTimeoutMs } = require('../config/env');
const ApiError = require('../utils/ApiError');

// HTTP client for the independent AI service (never exposed to the frontend)
const client = axios.create({ baseURL: aiServiceUrl, timeout: aiTimeoutMs });

// Calls the AI service and maps every failure to a meaningful HTTP error
const call = async (path, body) => {
  try {
    const { data } = await client.post(path, body);
    return data;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new ApiError(504, 'The AI service took too long to answer');
    }
    if (err.response) {
      const detail = err.response.data && err.response.data.detail;
      throw new ApiError(err.response.status === 504 ? 504 : 502, detail || 'AI service error');
    }
    throw new ApiError(502, 'AI service unreachable');
  }
};
const summarize = async (courseContent) => {
  const data = await call('/api/ai/summarize', { courseContent });
  if (!data || typeof data.summary !== 'string' || !data.summary.trim()) {
    throw new ApiError(502, 'Invalid answer from the AI service (summary)');
  }
  return data.summary;
};



module.exports = { summarize };