const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const course = require('../controllers/courseController');

const router = express.Router();

// Every course route requires authentication
router.use(protect);

const courseRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('content')
    .trim()
    .isLength({ min: 50, max: 50000 })
    .withMessage('Content must contain between 50 and 50000 characters'),
];

router.route('/').get(course.list).post(courseRules, validate, course.create);
router
  .route('/:id')
  .get(course.getOne)
  .put(courseRules, validate, course.update)
  .delete(course.remove);

module.exports = router;