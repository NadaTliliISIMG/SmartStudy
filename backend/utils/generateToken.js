const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

// Signs a JWT containing only the user id
module.exports = (userId) =>
  jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });