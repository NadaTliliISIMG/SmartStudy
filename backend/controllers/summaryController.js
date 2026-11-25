const Summary = require('../models/Summary');
const asyncHandler = require('../utils/asyncHandler');
const aiClient = require('../services/aiClient');
const { getOwnedCourse } = require('../services/courseService');

// POST /api/courses/:id/summary
// Flow: backend reads the course -> AI service generates -> backend saves in MongoDB
exports.generate = asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req.params.id, req.user._id);
  const content = await aiClient.summarize(course.content);
  const summary = await Summary.create({
    userId: req.user._id,
    courseId: course._id,
    content,
  });
  res.status(201).json(summary);
});

// GET /api/courses/:id/summaries
exports.listByCourse = asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req.params.id, req.user._id);
  const summaries = await Summary.find({ userId: req.user._id, courseId: course._id }).sort({
    createdAt: -1,
  });
  res.json(summaries);
});

// GET /api/summaries (history of all summaries of the user)
exports.listAll = asyncHandler(async (req, res) => {
  const summaries = await Summary.find({ userId: req.user._id })
    .populate('courseId', 'title subject')
    .sort({ createdAt: -1 });
  res.json(summaries);
});