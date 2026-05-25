const mongoose = require('mongoose');

const EXAMS = ['CGL', 'CHSL', 'MTS', 'GD', 'CPO', 'JE', 'STENO', 'OTHER'];
const SUBJECTS = ['QA', 'REASONING', 'ENGLISH', 'GA', 'CURRENT_AFFAIRS'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_TYPES = ['mcq', 'numerical'];

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // 'A' | 'B' | 'C' | 'D'
    text: { type: String, required: true },
    textHi: { type: String },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    exam: { type: String, enum: EXAMS, required: true, index: true },
    subject: { type: String, enum: SUBJECTS, required: true, index: true },
    topic: { type: String, required: true, index: true },
    chapter: { type: String, index: true },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'medium', index: true },
    type: { type: String, enum: QUESTION_TYPES, default: 'mcq' },
    question: { type: String, required: true },
    questionHi: { type: String },
    options: { type: [optionSchema], default: [] }, // empty for numerical
    correctAnswer: { type: String, required: true }, // option key OR numeric string
    explanation: { type: String, default: '' },
    explanationHi: { type: String },
    tricks: { type: String, default: '' },
    solutionSteps: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isPYQ: { type: Boolean, default: false, index: true },
    pyqYear: { type: Number },
    pyqExamSlot: { type: String },
    source: { type: String, default: 'curated' }, // curated | ai | imported
    stats: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

questionSchema.index({ exam: 1, subject: 1, topic: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);
module.exports.EXAMS = EXAMS;
module.exports.SUBJECTS = SUBJECTS;
module.exports.DIFFICULTIES = DIFFICULTIES;
