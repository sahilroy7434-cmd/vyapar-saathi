const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { recommendTopics, generateAdaptiveQuestionSet } = require('../services/aiService');

const router = express.Router();

router.get(
  '/recommendations',
  requireAuth,
  asyncHandler(async (req, res) => {
    const topics = await recommendTopics(req.user._id, { limit: 5 });
    res.json({ weakTopics: topics });
  }),
);

router.post(
  '/adaptive-set',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { exam, count = 10 } = req.body || {};
    const items = await generateAdaptiveQuestionSet(req.user._id, { exam, count });
    res.json({ items });
  }),
);

router.post(
  '/study-plan',
  requireAuth,
  asyncHandler(async (req, res) => {
    const weak = await recommendTopics(req.user._id, { limit: 3 });
    const today = new Date();
    const plan = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const focus = weak[i % Math.max(weak.length, 1)] || { subject: 'QA', topic: 'Mixed' };
      return {
        date: d.toISOString().slice(0, 10),
        focusSubject: focus.subject,
        focusTopic: focus.topic,
        targetQuestions: 50,
        targetMockTests: i % 3 === 0 ? 1 : 0,
      };
    });
    res.json({ plan });
  }),
);

module.exports = router;
