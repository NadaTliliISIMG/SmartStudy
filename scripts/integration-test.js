#!/usr/bin/env node
/**
 * Integration test: frontend (nginx) -> backend -> MongoDB, and optionally the AI service.
 * Requires Node 20+ (built-in fetch). No dependency to install.
 *
 *   node scripts/integration-test.js
 *   BASE_URL=http://192.168.56.10:3000 node scripts/integration-test.js
 *   RUN_AI=1 node scripts/integration-test.js      # also tests summary + quiz generation (needs Ollama)
 *
 * Environment variables:
 *   BASE_URL  entry point of the application (default http://localhost:3000)
 *   AI_URL    AI service health URL (default http://localhost:8000/health, checked only if reachable)
 *   RUN_AI    set to 1 to test the real AI generation (slow)
 */
const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const AI_URL = process.env.AI_URL || 'http://localhost:8000/health';
const RUN_AI = process.env.RUN_AI === '1';

const COURSE_TEXT =
  'HTTP is an application layer protocol used by the web. It follows a request-response model: ' +
  'the client sends a request and the server answers with a status code such as 200 or 404. ' +
  'The main methods are GET, POST, PUT and DELETE.';

let passed = 0;
let failed = 0;
const check = (name, condition, detail = '') => {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` -> ${detail}` : ''}`);
  }
};

const api = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* empty body */
  }
  return { status: res.status, data };
};
const register = async (label) => {
  const email = `it-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const res = await api('POST', '/auth/register', { body: { name: `IT ${label}`, email, password: 'secret123' } });
  return { ...res, email };
};

const main = async () => {
  console.log(`Integration test against ${BASE_URL}\n`);

  console.log('Health');
  const health = await api('GET', '/health');
  check('backend health answers 200', health.status === 200, `status ${health.status}`);
  check('backend is connected to MongoDB', health.data && health.data.database === 'connected');
  if (health.status !== 200) {
    console.log('\nBackend not healthy: stopping here.');
    process.exit(1);
  }

  try {
    const ai = await fetch(AI_URL);
    check('AI service health answers 200', ai.status === 200, `status ${ai.status}`);
  } catch (e) {
    console.log(`  SKIP  AI service health (${AI_URL} not reachable from here)`);
  }


  console.log('\nAuthentication');
  const unauth = await api('GET', '/courses');
  check('protected route without token returns 401', unauth.status === 401);

  const userA = await register('a');
  check('register returns 201 with a token', userA.status === 201 && Boolean(userA.data && userA.data.token));
  const tokenA = userA.data && userA.data.token;

  const dup = await api('POST', '/auth/register', { body: { name: 'dup', email: userA.email, password: 'secret123' } });
  check('registering the same email returns 409', dup.status === 409);

  const bad = await api('POST', '/auth/login', { body: { email: userA.email, password: 'wrong-password' } });
  check('login with a wrong password returns 401', bad.status === 401);

  const login = await api('POST', '/auth/login', { body: { email: userA.email, password: 'secret123' } });
  check('login returns 200 with a token', login.status === 200 && Boolean(login.data && login.data.token));

  const me = await api('GET', '/auth/me', { token: tokenA });
  check('/auth/me returns the user', me.status === 200 && me.data.user.email === userA.email);

  console.log('\nCourses');
  const created = await api('POST', '/courses', {
    token: tokenA,
    body: { title: 'HTTP basics', subject: 'Networks', content: COURSE_TEXT },
  });
  check('create course returns 201', created.status === 201, `status ${created.status}`);
  const courseId = created.data && created.data._id;

  const tooShort = await api('POST', '/courses', { token: tokenA, body: { title: 't', subject: 's', content: 'short' } });
  check('invalid course returns 400', tooShort.status === 400);

  const list = await api('GET', '/courses', { token: tokenA });
  check('course appears in the list', list.status === 200 && list.data.some((c) => c._id === courseId));

  const updated = await api('PUT', `/courses/${courseId}`, {
    token: tokenA,
    body: { title: 'HTTP advanced', subject: 'Networks', content: COURSE_TEXT },
  });
  check('update course returns the new title', updated.status === 200 && updated.data.title === 'HTTP advanced');

  console.log('\nData isolation');
  const userB = await register('b');
  const tokenB = userB.data && userB.data.token;
  const other = await api('GET', `/courses/${courseId}`, { token: tokenB });
  check("another user cannot read the course (404)", other.status === 404, `status ${other.status}`);
  const otherDelete = await api('DELETE', `/courses/${courseId}`, { token: tokenB });
  check("another user cannot delete the course (404)", otherDelete.status === 404, `status ${otherDelete.status}`);
  const listB = await api('GET', '/courses', { token: tokenB });
  check("another user's list is empty", listB.status === 200 && listB.data.length === 0);

  console.log('\nDashboard');
  const stats = await api('GET', '/dashboard/stats', { token: tokenA });
  check('dashboard counts the course', stats.status === 200 && stats.data.totalCourses === 1, JSON.stringify(stats.data));

  if (RUN_AI) {
    console.log('\nAI generation (slow, uses Ollama)');
    const summary = await api('POST', `/courses/${courseId}/summary`, { token: tokenA });
    check('summary generated and saved (201)', summary.status === 201 && Boolean(summary.data.content), `status ${summary.status}`);

    const quiz = await api('POST', `/courses/${courseId}/quiz`, { token: tokenA, body: { numberOfQuestions: 3 } });
    const quizOk = quiz.status === 201 && Array.isArray(quiz.data.questions) && quiz.data.questions.length > 0;
    check('quiz generated and saved (201)', quizOk, `status ${quiz.status}`);
    if (quizOk) {
      check(
        'every question has 4 options and a valid correct answer',
        quiz.data.questions.every((q) => q.options.length === 4 && q.options.includes(q.correctAnswer))
      );
      const answers = quiz.data.questions.map((q, i) => ({ questionIndex: i, selected: q.correctAnswer }));
      const result = await api('POST', `/quizzes/${quiz.data._id}/submit`, { token: tokenA, body: { answers } });
      check('perfect answers give a full score', result.status === 201 && result.data.score === quiz.data.questions.length);
      const results = await api('GET', '/results', { token: tokenA });
      check('score appears in the history', results.status === 200 && results.data.length === 1);
    }
  } else {
    console.log('\nAI generation skipped (set RUN_AI=1 to test it)');
  }

  console.log('\nCleanup');
  const del = await api('DELETE', `/courses/${courseId}`, { token: tokenA });
  check('delete course returns 200', del.status === 200);
  const after = await api('GET', `/courses/${courseId}`, { token: tokenA });
  check('deleted course returns 404', after.status === 404);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
};

main().catch((err) => {
  console.error('\nUnexpected error:', err.message);
  process.exit(1);
});