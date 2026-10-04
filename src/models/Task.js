const mongoose = require('mongoose');

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    dueDate: { type: Date, default: null },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  // createdAt = "Created Date"
  { timestamps: true }
);

taskSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
module.exports.STATUSES = STATUSES;
module.exports.PRIORITIES = PRIORITIES;
