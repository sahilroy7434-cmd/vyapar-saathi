const express = require('express');
const Question = require('../models/Question');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Browse / filter questions
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { exam, subject, topic, difficulty, isPYQ, q, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (exam) filter.exam = exam;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (isPYQ === 'true') filter.isPYQ = true;
    if (q) filter.$text = { $search: String(q) };

    const lim = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * lim;

    const [items, total] = await Promise.all([
      Question.find(filter).limit(lim).skip(skip).lean(),
      Question.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), limit: lim });
  }),
);

// Random practice set (adaptive-friendly)
router.get(
  '/practice',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { exam, subject, topic, difficulty, count = 10 } = req.query;
    const match = {};
    if (exam) match.exam = exam;
    if (subject) match.subject = subject;
    if (topic) match.topic = topic;
    if (difficulty) match.difficulty = difficulty;
    const size = Math.min(parseInt(count, 10) || 10, 50);
    const items = await Question.aggregate([{ $match: match }, { $sample: { size } }]);
    res.json({ items });
  }),
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = await Question.findById(req.params.id).lean();
    if (!q) return res.status(404).json({ error: 'not_found' });
    res.json({ question: q });
  }),
);

module.exports = router;
