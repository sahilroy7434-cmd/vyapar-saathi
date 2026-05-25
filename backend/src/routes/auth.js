const express = require('express');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const { signTokens, requireAuth } = require('../middleware/auth');

const router = express.Router();

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  language: z.enum(['en', 'hi']).optional(),
  targetExams: z.array(z.string()).optional(),
});

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const data = signupSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ error: 'email_taken' });

    const user = new User({
      name: data.name,
      email: data.email,
      language: data.language || 'en',
      targetExams: data.targetExams || ['CGL'],
      authProviders: ['password'],
    });
    await user.setPassword(data.password);
    await user.save();
    const tokens = signTokens(user);
    res.status(201).json({ user: user.toSafeJSON(), ...tokens });
  }),
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await user.checkPassword(password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const tokens = signTokens(user);
    res.json({ user: user.toSafeJSON(), ...tokens });
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(400).json({ error: 'missing_refresh_token' });
    try {
      const payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
      const user = await User.findById(payload.sub);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      const tokens = signTokens(user);
      res.json(tokens);
    } catch (err) {
      return res.status(401).json({ error: 'invalid_refresh_token' });
    }
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ user: user.toSafeJSON() });
  }),
);

// Google login placeholder — verify Firebase ID token then upsert user.
router.post(
  '/google',
  asyncHandler(async (_req, res) => {
    res.status(501).json({
      error: 'not_implemented',
      message:
        'Wire firebase-admin verifyIdToken here, then upsert User and return signTokens(user).',
    });
  }),
);

module.exports = router;
