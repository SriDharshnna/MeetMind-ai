import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  owner: {
    type: String,
    required: [true, 'Task owner is required'],
    trim: true
  },
  ownerAvatar: {
    type: String,
    default: 'TM'
  },
  deadline: {
    type: String,
    required: [true, 'Task deadline is required']
  },
  priority: {
    type: String,
    enum: {
      values: ['High', 'Medium', 'Low'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'Medium'
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'In Progress', 'Completed'],
      message: '{VALUE} is not a valid task status'
    },
    default: 'Pending'
  },
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: [true, 'Originating meeting ID is required']
  },
  meetingTitle: {
    type: String,
    default: 'Meeting Reference'
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Dynamic virtual field to calculate whether task is overdue
// CRITICAL RULE: Completed tasks are NEVER classified as overdue!
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed') return false;
  if (!this.deadline) return false;

  const deadlineDate = new Date(this.deadline);
  if (isNaN(deadlineDate.getTime())) return false;
  deadlineDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return deadlineDate < today;
});

// Calculate days remaining or overdue
taskSchema.virtual('daysDiff').get(function () {
  if (!this.deadline) return 0;
  const deadlineDate = new Date(this.deadline);
  if (isNaN(deadlineDate.getTime())) return 0;
  deadlineDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate - today;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
});

export const Task = mongoose.model('Task', taskSchema);
