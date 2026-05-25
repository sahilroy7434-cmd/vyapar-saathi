const express = require('express');
const { z } = require('zod');

const Attempt = require('../models/Attempt');
const MockTest = require('../models/MockTest');
const User = require('../models/User');
const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { gradeAnswers, computePercentile } = require('../services/scoringService');

const router = express.Router();

const submitSchema = z.object({
  mode: z.enum(['mock', 'practice', 'daily']),
  mockTestId: z.string().optional(),
  practiceMeta: z
    .object({
      exam: z.string().optional(),
      subject: z.string().optional(),
      topic: z.string().optional(),
      difficulty: z.string().optional(),
    })
    .optional(),
  timeSpentSec: z.number().int().nonnegative().default(0),
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        selected: z.string().nullable().optional(),
        timeSpentSec: z.number().int().nonnegative().default(0),
        marked: z.boolean().optional(),
        skipped: z.boolean().optional(),
      }),
    )
    .min(1),
});

router.post(
  '/submit',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = submitSchema.parse(req.body);
    let mockTest = null;
    if (data.mode === 'mock' && data.mockTestId) {
      mockTest = await MockTest.findById(data.mockTestId).lean();
      if (!mockTest) return res.status(404).json({ error: 'mock_test_not_found' });
    }

    const grading = await gradeAnswers({ answers: data.answers, mockTest });
    const attempt = await Attempt.create({
      user: req.user._id,
      mode: data.mode,
      mockTest: mockTest ? mockTest._id : undefined,
      practiceMeta: data.practiceMeta,
      answers: grading.graded,
      score: grading.score,
      maxScore: grading.maxScore,
      correct: grading.correct,
      incorrect: grading.incorrect,
      skipped: grading.skipped,
      accuracy: grading.accuracy,
      timeSpentSec: data.timeSpentSec,
    });

    if (mockTest) {
      const { percentile, rank } = await computePercentile(req.user._id, mockTest._id, grading.score);
      attempt.percentile = percentile;
      attempt.rank = rank;
      await attempt.save();
    }

    // Update lightweight question stats and user stats (fire-and-forget)
    Question.bulkWrite(
      grading.graded.map((a) => ({
        updateOne: {
          filter: { _id: a.questionId },
          update: { $inc: { 'stats.attempts': 1, 'stats.correct': a.isCorrect ? 1 : 0 } },
        },
      })),
    ).catch(() => {});
    User.updateOne(
      { _id: req.user._id },
      {
        $inc: {
          'stats.totalAttempts': 1,
          'stats.totalQuestions': grading.graded.length,
          'stats.totalCorrect': grading.correct,
        },
        $set: { 'stats.lastActiveAt': new Date() },
      },
    ).catch(() => {});

    res.status(201).json({ attempt });
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await Attempt.find({ user: req.user._id })
      .sort({ submittedAt: -1 })
      .limit(50)
      .select('-answers')
      .lean();
    res.json({ items });
  }),
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const attempt = await Attempt.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!attempt) return res.status(404).json({ error: 'not_found' });
    res.json({ attempt });
  }),
);

module.exports = router;
