const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { connectDb } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const mockTestRoutes = require('./routes/mockTests');
const attemptRoutes = require('./routes/attempts');
const analyticsRoutes = require('./routes/analytics');
const dailyRoutes = require('./routes/daily');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length === 0 ? true : env.corsOrigins,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/v1', apiLimiter);

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/v1/auth', authRoutes);
app.use('/v1/questions', questionRoutes);
app.use('/v1/mock-tests', mockTestRoutes);
app.use('/v1/attempts', attemptRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/daily', dailyRoutes);
app.use('/v1/ai', aiRoutes);
app.use('/v1/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'not_found', path: req.originalUrl }));
app.use(errorHandler);

async function bootstrap() {
  await connectDb();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on :${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] failed to start', err);
  process.exit(1);
});

module.exports = app;
