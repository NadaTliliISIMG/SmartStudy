const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { corsOrigin } = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '2mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/health', healthRoutes);
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/summaries', require('./routes/summary.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
