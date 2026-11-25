const express = require('express');
const { protect } = require('../middleware/auth');
const { stats } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', protect, stats);

module.exports = router;