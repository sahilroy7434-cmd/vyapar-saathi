/**
 * Scoring helpers for mock tests and practice attempts.
 */
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');

async function gradeAnswers({ answers, mockTest }) {
  const ids = answers.map((a) => a.questionId);
  const questions = await Question.find({ _id: { $in: ids } })
    .select('_id correctAnswer subject topic')
    .lean();
  const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

  // Build a section map for marks/negative if mockTest provided
  const qToSection = new Map();
  if (mockTest) {
    for (const sec of mockTest.sections) {
      for (const qid of sec.questions) {
        qToSection.set(qid.toString(), sec);
      }
    }
  }

  let score = 0;
  let maxScore = 0;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  const graded = answers.map((a) => {
    const q = qMap.get(a.questionId.toString());
    const sec = qToSection.get(a.questionId.toString());
    const mpq = sec ? sec.marksPerQuestion : 1;
    const neg = sec ? sec.negativeMarks : 0;
    maxScore += mpq;

    if (!q) return { ...a, isCorrect: false };

    if (a.skipped || a.selected == null || a.selected === '') {
      skipped += 1;
      return { ...a, isCorrect: false, skipped: true };
    }
    const isCorrect = String(a.selected).trim() === String(q.correctAnswer).trim();
    if (isCorrect) {
      correct += 1;
      score += mpq;
    } else {
      incorrect += 1;
      score -= neg;
    }
    return { ...a, isCorrect };
  });

  const total = correct + incorrect + skipped || 1;
  const accuracy = correct / total;
  return { graded, score, maxScore, correct, incorrect, skipped, accuracy };
}

async function computePercentile(userId, mockTestId, score) {
  if (!mockTestId) return { percentile: 0, rank: 0 };
  const attempts = await Attempt.find({ mockTest: mockTestId })
    .select('score user')
    .sort({ score: -1 })
    .lean();
  if (attempts.length === 0) return { percentile: 100, rank: 1 };
  const better = attempts.filter((a) => a.score > score).length;
  const rank = better + 1;
  const percentile = Math.round(((attempts.length - rank) / attempts.length) * 100);
  return { percentile, rank };
}

module.exports = { gradeAnswers, computePercentile };
