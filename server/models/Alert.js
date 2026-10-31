import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['overdue_task', 'repeated_topic', 'pending_decision', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Task', 'Decision', 'Meeting']
  },
  referenceTitle: {
    type: String
  },
  daysOverdue: {
    type: Number,
    default: 0
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to prevent duplicate alerts for the same task/event
alertSchema.index({ type: 1, referenceId: 1, isResolved: 1 }, { unique: false });

export const Alert = mongoose.model('Alert', alertSchema);
