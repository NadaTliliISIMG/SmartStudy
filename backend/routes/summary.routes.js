const express = require('express');
const { protect } = require('../middleware/auth');
const { listAll } = require('../controllers/summaryController');

const router = express.Router();

router.get('/', protect, listAll);

module.exports = router;