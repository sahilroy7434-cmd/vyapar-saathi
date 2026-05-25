const express = require('express');
const { z } = require('zod');

const Question = require('../models/Question');
const MockTest = require('../models/MockTest');
const User = require('../models/User');
const DailyContent = require('../models/DailyContent');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [questions, users, mocks, daily] = await Promise.all([
      Question.countDocuments(),
      User.countDocuments(),
      MockTest.countDocuments(),
      DailyContent.countDocuments(),
    ]);
    res.json({ questions, users, mocks, daily });
  }),
);

const questionInputSchema = z.object({
  exam: z.string(),
  subject: z.string(),
  topic: z.string(),
  chapter: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  type: z.enum(['mcq', 'numerical']).default('mcq'),
  question: z.string(),
  questionHi: z.string().optional(),
  options: z
    .array(
      z.object({
        key: z.string(),
        text: z.string(),
        textHi: z.string().optional(),
      }),
    )
    .optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  tricks: z.string().optional(),
  solutionSteps: z.array(z.string()).optional(),
  isPYQ: z.boolean().optional(),
  pyqYear: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

router.post(
  '/questions',
  asyncHandler(async (req, res) => {
    const data = questionInputSchema.parse(req.body);
    const q = await Question.create(data);
    res.status(201).json({ question: q });
  }),
);

router.post(
  '/questions/bulk',
  asyncHandler(async (req, res) => {
    const arr = z.array(questionInputSchema).parse(req.body.items || []);
    const inserted = await Question.insertMany(arr, { ordered: false });
    res.status(201).json({ inserted: inserted.length });
  }),
);

router.put(
  '/questions/:id',
  asyncHandler(async (req, res) => {
    const data = questionInputSchema.partial().parse(req.body);
    const q = await Question.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!q) return res.status(404).json({ error: 'not_found' });
    res.json({ question: q });
  }),
);

router.delete(
  '/questions/:id',
  asyncHandler(async (req, res) => {
    const r = await Question.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'not_found' });
    res.json({ ok: true });
  }),
);

router.post(
  '/mock-tests',
  asyncHandler(async (req, res) => {
    const mock = await MockTest.create(req.body);
    res.status(201).json({ mockTest: mock });
  }),
);

router.post(
  '/daily',
  asyncHandler(async (req, res) => {
    const item = await DailyContent.findOneAndUpdate(
      { date: req.body.date, type: req.body.type },
      req.body,
      { new: true, upsert: true },
    );
    res.status(201).json({ item });
  }),
);

module.exports = router;
