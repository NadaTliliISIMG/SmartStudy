const mongoose = require('mongoose');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');

// Returns the course only if it belongs to the user.
// A missing course and someone else's course both give 404, so the API never
// reveals that a course owned by another user exists.
const getOwnedCourse = async (courseId, userId) => {
  if (!mongoose.isValidObjectId(courseId)) throw new ApiError(404, 'Course not found');
  const course = await Course.findOne({ _id: courseId, userId });
  if (!course) throw new ApiError(404, 'Course not found');
  return course;
};

module.exports = { getOwnedCourse };