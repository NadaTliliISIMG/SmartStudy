const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') status = 400;
  if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  }
  if (err instanceof SyntaxError && err.status === 400) message = 'Invalid JSON';

  res.status(err.status === 400 ? 400 : status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };