/**
 * Pluggable AI service.
 *
 * Today: rule-based recommendations using the user's recent attempts.
 * Tomorrow: replace internals with OpenAI / Bedrock / a hosted model.
 * Public surface (recommendTopics, generateAdaptiveQuestion) stays stable.
 */
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');

async function recommendTopics(userId, { limit = 5 } = {}) {
  const recent = await Attempt.find({ user: userId })
    .sort({ submittedAt: -1 })
    .limit(20)
    .populate('answers.questionId', 'topic subject')
    .lean();

  const buckets = new Map(); // key=`${subject}::${topic}` -> {attempts, correct}
  for (const a of recent) {
    for (const ans of a.answers) {
      const q = ans.questionId;
      if (!q) continue;
      const key = `${q.subject}::${q.topic}`;
      const b = buckets.get(key) || { subject: q.subject, topic: q.topic, attempts: 0, correct: 0 };
      b.attempts += 1;
      if (ans.isCorrect) b.correct += 1;
      buckets.set(key, b);
    }
  }

  const ranked = Array.from(buckets.values())
    .filter((b) => b.attempts >= 3)
    .map((b) => ({ ...b, accuracy: b.correct / b.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy) // weakest first
    .slice(0, limit);

  return ranked;
}

async function generateAdaptiveQuestionSet(userId, { exam, count = 10 } = {}) {
  const weak = await recommendTopics(userId, { limit: 3 });
  const filter = { exam: exam || { $exists: true } };
  if (weak.length > 0) {
    filter.$or = weak.map((w) => ({ subject: w.subject, topic: w.topic }));
  }
  // Bias toward medium difficulty for adaptive practice
  const easy = Math.floor(count * 0.3);
  const hard = Math.floor(count * 0.2);
  const medium = count - easy - hard;

  const [e, m, h] = await Promise.all([
    Question.aggregate([{ $match: { ...filter, difficulty: 'easy' } }, { $sample: { size: easy } }]),
    Question.aggregate([{ $match: { ...filter, difficulty: 'medium' } }, { $sample: { size: medium } }]),
    Question.aggregate([{ $match: { ...filter, difficulty: 'hard' } }, { $sample: { size: hard } }]),
  ]);
  return [...e, ...m, ...h].sort(() => Math.random() - 0.5);
}

module.exports = { recommendTopics, generateAdaptiveQuestionSet };
