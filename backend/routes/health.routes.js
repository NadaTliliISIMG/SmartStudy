const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/health: used by Docker healthchecks, Jenkins and Nagios
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const healthy = dbState === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'backend',
    database: dbState,
    uptime: process.uptime(),
  });
});

module.exports = router;