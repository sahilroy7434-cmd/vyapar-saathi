const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    const payload = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(401).json({ error: 'unauthorized' });

    req.user = user;
    req.token = token;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'unauthorized', detail: err.message });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  return next();
}

function signTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl });
  const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshTtl });
  return { accessToken, refreshToken };
}

module.exports = { requireAuth, requireAdmin, signTokens };
