const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Central error handler: maps known errors to clean responses, hides internals.
const errorHandler = (err, _req, res, _next) => {
  let { statusCode = 500, message, errors } = err;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email is already registered';
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
