const router = require('express').Router();
const { createTask, getTasks, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTaskRules, updateTaskRules, taskIdRules, listTaskRules } = require('../validators/taskValidators');

router.use(protect); // every task route requires a valid JWT

router.route('/')
  .post(createTaskRules, validate, createTask)
  .get(listTaskRules, validate, getTasks);

router.route('/:id')
  .get(taskIdRules, validate, getTask)
  .put(updateTaskRules, validate, updateTask)
  .delete(taskIdRules, validate, deleteTask);

module.exports = router;
