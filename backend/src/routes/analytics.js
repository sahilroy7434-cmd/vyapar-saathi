const express = require('express');
const Attempt = require('../models/Attempt');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { recommendTopics } = require('../services/aiService');

const router = express.Router();

router.get(
  '/dashboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const recent = await Attempt.find({ user: userId })
      .sort({ submittedAt: -1 })
      .limit(20)
      .select('mode score maxScore accuracy timeSpentSec percentile rank submittedAt')
      .lean();

    const totals = recent.reduce(
      (acc, a) => {
        acc.attempts += 1;
        acc.totalCorrect += a.correct || 0;
        acc.totalQuestions += (a.correct || 0) + (a.incorrect || 0) + (a.skipped || 0);
        acc.totalTime += a.timeSpentSec || 0;
        return acc;
      },
      { attempts: 0, totalCorrect: 0, totalQuestions: 0, totalTime: 0 },
    );
    const avgAccuracy =
      recent.length > 0 ? recent.reduce((s, a) => s + (a.accuracy || 0), 0) / recent.length : 0;

    const weakTopics = await recommendTopics(userId, { limit: 5 });

    // Last-7-days progress
    const last7 = recent
      .filter((a) => new Date(a.submittedAt) > new Date(Date.now() - 7 * 24 * 3600 * 1000))
      .map((a) => ({
        date: new Date(a.submittedAt).toISOString().slice(0, 10),
        score: a.score,
        accuracy: a.accuracy,
      }));

    res.json({
      summary: { ...totals, avgAccuracy },
      weakTopics,
      recentAttempts: recent.slice(0, 10),
      last7days: last7,
    });
  }),
);

router.get(
  '/leaderboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { mockTestId, limit = 25 } = req.query;
    const filter = {};
    if (mockTestId) filter.mockTest = mockTestId;
    else filter.mode = 'mock';

    const top = await Attempt.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$user',
          bestScore: { $max: '$score' },
          attempts: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracy' },
        },
      },
      { $sort: { bestScore: -1 } },
      { $limit: Math.min(parseInt(limit, 10) || 25, 100) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          bestScore: 1,
          attempts: 1,
          avgAccuracy: 1,
        },
      },
    ]);
    res.json({ items: top });
  }),
);

module.exports = router;
