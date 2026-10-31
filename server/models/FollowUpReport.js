import mongoose from 'mongoose';

const agendaItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  topic: { type: String, required: true },
  leader: { type: String, required: true },
  objective: { type: String, required: true },
  rationale: { type: String, default: '' }
}, { _id: false });

const repeatedTopicSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  frequency: { type: String, required: true },
  recommendation: { type: String, required: true },
  status: { type: String, default: 'Unresolved' }
}, { _id: false });

const followUpReportSchema = new mongoose.Schema({
  generatedAt: {
    type: Date,
    default: Date.now
  },
  suggestedAgenda: [agendaItemSchema],
  repeatedTopics: [repeatedTopicSchema],
  outstandingCommitmentsCount: {
    type: Number,
    default: 0
  },
  pendingDecisionsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Reviewed', 'Archived'],
    default: 'Draft'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const FollowUpReport = mongoose.model('FollowUpReport', followUpReportSchema);
