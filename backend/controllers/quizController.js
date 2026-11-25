const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const aiClient = require('../services/aiClient');
const { getOwnedCourse } = require('../services/courseService');
const { computeScore } = require('../utils/scoring');

// Returns the quiz only if it belongs to the user (otherwise 404)
const getOwnedQuiz = async (quizId, userId) => {
  if (!mongoose.isValidObjectId(quizId)) throw new ApiError(404, 'Quiz not found');
  const quiz = await Quiz.findOne({ _id: quizId, userId });
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  return quiz;
};

// POST /api/courses/:id/quiz
// Flow: backend reads the course -> AI service generates the questions -> backend saves the quiz
exports.generate = asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req.params.id, req.user._id);
  const n = parseInt(req.body.numberOfQuestions, 10) || 5;
  const questions = await aiClient.generateQuiz(course.content, n);
  const quiz = await Quiz.create({ userId: req.user._id, courseId: course._id, questions });
  res.status(201).json(quiz);
});

// GET /api/courses/:id/quizzes
exports.listByCourse = asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req.params.id, req.user._id);
  res.json(await Quiz.find({ userId: req.user._id, courseId: course._id }).sort({ createdAt: -1 }));
});

// GET /api/quizzes
exports.listAll = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ userId: req.user._id })
    .populate('courseId', 'title subject')
    .sort({ createdAt: -1 });
  res.json(quizzes);
});
// GET /api/quizzes/:quizId
exports.getOne = asyncHandler(async (req, res) => {
  res.json(await getOwnedQuiz(req.params.quizId, req.user._id));
});

// POST /api/quizzes/:quizId/submit
// The score is computed on the server: the client never sends it
exports.submit = asyncHandler(async (req, res) => {
  const quiz = await getOwnedQuiz(req.params.quizId, req.user._id);
  const { score, totalQuestions, answers } = computeScore(quiz.questions, req.body.answers);
  const result = await QuizResult.create({
    userId: req.user._id,
    quizId: quiz._id,
    courseId: quiz.courseId,
    score,
    totalQuestions,
    answers,
  });
  res.status(201).json(result);
});
// GET /api/quizzes/:quizId/results
exports.resultsByQuiz = asyncHandler(async (req, res) => {
  const quiz = await getOwnedQuiz(req.params.quizId, req.user._id);
  res.json(await QuizResult.find({ userId: req.user._id, quizId: quiz._id }).sort({ createdAt: -1 }));
});

// GET /api/results (history of all scores)
exports.listAllResults = asyncHandler(async (req, res) => {
  const results = await QuizResult.find({ userId: req.user._id })
    .populate('courseId', 'title subject')
    .sort({ createdAt: -1 });
  res.json(results);
});