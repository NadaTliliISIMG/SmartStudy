const path = require('path');
// Reads the shared .env at the repository root (ignored silently if absent, e.g. in Docker)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/smartstudy',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS, 10) || 120000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};