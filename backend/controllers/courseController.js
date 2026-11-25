const Course = require('../models/Course');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const asyncHandler = require('../utils/asyncHandler');
const { getOwnedCourse } = require('../services/courseService');

// GET /api/courses
exports.list = asyncHandler(async (req, res) => {
  const courses = await Course.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(courses);
});

// POST /api/courses
exports.create = asyncHandler(async (req, res) => {
  const { title, subject, content } = req.body;
  const course = await Course.create({ userId: req.user._id, title, subject, content });
  res.status(201).json(course);
});
// GET /api/courses/:id
exports.getOne = asyncHandler(async (req, res) => {
  res.json(await getOwnedCourse(req.params.id, req.user._id));
});

// PUT /api/courses/:id
exports.update = asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req.params.id, req.user._id);
  const { title, subject, content } = req.body;
  Object.assign(course, { title, subject, content });
  await course.save();
  res.json(course);
});

// DELETE /api/courses/:id (cascade: summaries, quizzes and quiz results of the course)
exports.remove = asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req.params.id, req.user._id);
  await Promise.all([
    Summary.deleteMany({ courseId: course._id }),
    Quiz.deleteMany({ courseId: course._id }),
    QuizResult.deleteMany({ courseId: course._id }),
  ]);
  await course.deleteOne();
  res.json({ message: 'Course deleted' });
});