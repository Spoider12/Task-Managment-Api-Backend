const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Runs after validator chains; turns failures into a 400 response.
module.exports = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new AppError('Validation failed', 400, errors));
};
