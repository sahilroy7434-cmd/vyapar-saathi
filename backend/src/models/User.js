const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SUPPORTED_LANGUAGES = ['en', 'hi'];
const ROLES = ['student', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true, sparse: true },
    passwordHash: { type: String },
    authProviders: { type: [String], default: ['password'] }, // password | google | phone
    role: { type: String, enum: ROLES, default: 'student' },
    language: { type: String, enum: SUPPORTED_LANGUAGES, default: 'en' },
    targetExams: { type: [String], default: [] }, // ['CGL','CHSL',...]
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    stats: {
      totalAttempts: { type: Number, default: 0 },
      totalCorrect: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      avgAccuracy: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      lastActiveAt: { type: Date },
    },
    weakTopics: { type: [String], default: [] },
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

userSchema.methods.checkPassword = function checkPassword(plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ virtuals: false });
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
module.exports.ROLES = ROLES;
