const express = require('express');
const { protect } = require('../middleware/auth');
const { listAllResults } = require('../controllers/quizController');

const router = express.Router();

router.get('/', protect, listAllResults);

module.exports = router;