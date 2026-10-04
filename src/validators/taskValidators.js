const { body, param, query } = require('express-validator');
const { STATUSES, PRIORITIES } = require('../models/Task');

const idRule = param('id').isMongoId().withMessage('Invalid task id');

const fields = (required) => {
  const title = body('title').trim();
  return [
    required
      ? title.notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title must be at most 100 characters')
      : title.optional().notEmpty().withMessage('Title cannot be empty').isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
    body('description').optional().isString().withMessage('Description must be a string').trim().isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters'),
    body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
    body('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
    body('dueDate').optional({ values: 'null' }).isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  ];
};

const createTaskRules = fields(true);
const updateTaskRules = [idRule, ...fields(false)];
const taskIdRules = [idRule];

const listTaskRules = [
  query('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  query('priority').optional().isIn(PRIORITIES).withMessage(`Priority must be one of: ${PRIORITIES.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
];

module.exports = { createTaskRules, updateTaskRules, taskIdRules, listTaskRules };
