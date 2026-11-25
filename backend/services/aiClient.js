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

// The backend does not blindly trust the AI service: every question is re-validated
const isValidQuestion = (q) =>
  Boolean(
    q &&
      typeof q.question === 'string' &&
      q.question.trim() &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((o) => typeof o === 'string' && o.trim()) &&
      new Set(q.options).size === 4 &&
      typeof q.correctAnswer === 'string' &&
      q.options.includes(q.correctAnswer)
  );

const generateQuiz = async (courseContent, numberOfQuestions) => {
  const data = await call('/api/ai/generate-quiz', { courseContent, numberOfQuestions });
  const questions = Array.isArray(data && data.questions) ? data.questions.filter(isValidQuestion) : [];
  if (questions.length === 0) {
    throw new ApiError(502, 'Invalid answer from the AI service (quiz)');
  }
  return questions.map(({ question, options, correctAnswer }) => ({ question, options, correctAnswer }));
};

module.exports = { summarize, generateQuiz };