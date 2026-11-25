const Course = require('../models/Course');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/stats
exports.stats = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  const [totalCourses, totalSummaries, totalQuizzes, recentCourses] = await Promise.all([
    Course.countDocuments(filter),
    Summary.countDocuments(filter),
    Quiz.countDocuments(filter),
    Course.find(filter).sort({ createdAt: -1 }).limit(5).select('title subject createdAt'),
  ]);
  res.json({ totalCourses, totalSummaries, totalQuizzes, recentCourses });
});