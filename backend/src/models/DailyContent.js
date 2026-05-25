const mongoose = require('mongoose');

const TYPES = ['quiz', 'currentAffairs', 'vocabulary', 'miniTest', 'grandTest'];

const dailyContentSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    type: { type: String, enum: TYPES, required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    payload: { type: mongoose.Schema.Types.Mixed, default: {} }, // articles, words, etc.
  },
  { timestamps: true },
);

dailyContentSchema.index({ date: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('DailyContent', dailyContentSchema);
module.exports.TYPES = TYPES;
