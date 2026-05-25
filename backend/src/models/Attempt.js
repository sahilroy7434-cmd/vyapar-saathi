const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selected: { type: String }, // option key or numeric
    isCorrect: { type: Boolean, default: false },
    timeSpentSec: { type: Number, default: 0 },
    marked: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
  },
  { _id: false },
);

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: { type: String, enum: ['mock', 'practice', 'daily'], required: true, index: true },
    mockTest: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', index: true },
    practiceMeta: {
      exam: String,
      subject: String,
      topic: String,
      difficulty: String,
    },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // 0..1
    timeSpentSec: { type: Number, default: 0 },
    percentile: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

attemptSchema.index({ user: 1, submittedAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
