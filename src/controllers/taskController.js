const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];
const pick = (obj) => Object.fromEntries(ALLOWED_FIELDS.filter((k) => k in obj).map((k) => [k, obj[k]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/tasks
exports.createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...pick(req.body), user: req.user._id });
  res.status(201).json({ success: true, data: task });
});

// GET /api/tasks?search=&status=&priority=&page=&limit=
exports.getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Always scoped to the logged-in user
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/tasks/:id
exports.getTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new AppError('Task not found', 404);
  res.json({ success: true, data: task });
});

// PUT /api/tasks/:id
exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    pick(req.body),
    { new: true, runValidators: true }
  );
  if (!task) throw new AppError('Task not found', 404);
  res.json({ success: true, data: task });
});

// DELETE /api/tasks/:id
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!task) throw new AppError('Task not found', 404);
  res.json({ success: true, message: 'Task deleted successfully' });
});
