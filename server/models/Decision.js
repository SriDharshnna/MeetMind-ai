import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Decision title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  responsiblePerson: {
    type: String,
    trim: true,
    default: 'Engineering Team'
  },
  implementationStatus: {
    type: String,
    enum: {
      values: ['Decided', 'In Progress', 'Implemented'],
      message: '{VALUE} is not a valid implementation status'
    },
    default: 'Decided'
  },
  category: {
    type: String,
    default: 'Architecture'
  },
  rationale: {
    type: String,
    default: ''
  },
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: [true, 'Originating meeting reference is required']
  },
  meetingTitle: {
    type: String,
    default: 'Meeting Reference'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Decision = mongoose.model('Decision', decisionSchema);
