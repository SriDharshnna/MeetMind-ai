import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Team Member' },
  avatar: { type: String, default: 'TM' },
  color: { type: String, default: '#426B50' }
}, { _id: false });

const discussionPointSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  notes: { type: String, required: true },
  speaker: { type: String, default: 'Speaker' }
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'Meeting date is required']
  },
  time: {
    type: String,
    default: '10:00 AM'
  },
  duration: {
    type: String,
    default: '60 mins'
  },
  participants: [participantSchema],
  transcript: {
    type: String,
    required: [true, 'Meeting transcript/notes are required']
  },
  summary: {
    type: String,
    default: ''
  },
  discussionPoints: [discussionPointSchema],
  status: {
    type: String,
    enum: ['Draft', 'Approved'],
    default: 'Draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for tasks associated with this meeting
meetingSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'meetingId'
});

// Virtual populate for decisions associated with this meeting
meetingSchema.virtual('decisions', {
  ref: 'Decision',
  localField: '_id',
  foreignField: 'meetingId'
});

export const Meeting = mongoose.model('Meeting', meetingSchema);
