const express = require('express');
const DailyContent = require('../models/DailyContent');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { date = todayKey() } = req.query;
    const items = await DailyContent.find({ date })
      .populate('questions', '-correctAnswer -explanation')
      .lean();
    res.json({ date, items });
  }),
);

router.get(
  '/:type',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    const { date = todayKey() } = req.query;
    const item = await DailyContent.findOne({ date, type })
      .populate('questions', '-correctAnswer -explanation')
      .lean();
    if (!item) return res.status(404).json({ error: 'not_found' });
    res.json({ item });
  }),
);

module.exports = router;
