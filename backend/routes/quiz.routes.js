const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const quiz = require('../controllers/quizController');

const router = express.Router();
router.use(protect);

router.get('/', quiz.listAll);
router.get('/:quizId', quiz.getOne);
router.post(
  '/:quizId/submit',
  [body('answers').isArray().withMessage('answers must be an array')],
  validate,
  quiz.submit
);
router.get('/:quizId/results', quiz.resultsByQuiz);
module.exports = router;