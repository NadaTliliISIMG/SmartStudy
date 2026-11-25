const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const course = require('../controllers/courseController');
const summary = require('../controllers/summaryController');
const quiz = require('../controllers/quizController');

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

router.post('/:id/summary', summary.generate);
router.get('/:id/summaries', summary.listByCourse);

router.post(
  '/:id/quiz',
  [body('numberOfQuestions').optional().isInt({ min: 1, max: 20 }).withMessage('numberOfQuestions must be between 1 and 20')],
  validate,
  quiz.generate
);
router.get('/:id/quizzes', quiz.listByCourse);

module.exports = router;