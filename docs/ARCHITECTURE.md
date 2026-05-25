# Architecture

## High-level

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  Mobile App  │    │  Admin Web   │    │   Web Landing    │
│ (RN / Expo)  │    │ (React/Vite) │    │   (optional)     │
└──────┬───────┘    └──────┬───────┘    └──────────────────┘
       │ HTTPS / JWT       │ HTTPS / JWT
       ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│           Node.js + Express REST API (stateless)         │
│   auth · questions · mockTests · attempts · analytics    │
│         daily · ai · admin · uploads · webhooks          │
└──────┬───────────────┬──────────────┬─────────────┬──────┘
       │               │              │             │
       ▼               ▼              ▼             ▼
   MongoDB         Redis*         S3 / GCS*     AI Provider*
 (questions,    (cache, rate-    (PDF notes,    (OpenAI /
  attempts,      limit, queues)   videos)        Bedrock)
  users)
                                       *optional in dev
```

## Why this stack

- **React Native (Expo)** — a single codebase for iOS + Android, OTA updates, fastest path to launch.
- **Node.js + Express** — mature, huge ecosystem, easy to scale horizontally behind a load balancer.
- **MongoDB** — schema flexibility for question variants, explanations, multilingual fields, and analytics events.
- **JWT auth** — stateless, scales horizontally; refresh tokens rotated on use; Firebase used for Google / phone OTP at the edge, then exchanged for our JWT.
- **Pluggable AI service** — `services/aiService.js` is a thin adapter, today returns rule-based recommendations; tomorrow plug OpenAI/Bedrock with no controller changes.

## Data Model (Mongo)

- **User** — profile, authProviders, language, exam preferences, role (`student` | `admin`), bookmarks, stats snapshot.
- **Question** — `exam`, `subject`, `topic`, `chapter`, `difficulty`, `type` (mcq/numerical), `options[]`, `correctAnswer`, `explanation`, `tricks`, `tags[]`, `language` (en/hi), `isPYQ`, `pyqYear`.
- **MockTest** — `title`, `exam`, `sections[]` (each with subject, durationSec, questionIds, marksPerQ, negative), `totalDurationSec`, `isAuto` (system-generated).
- **Attempt** — `userId`, `mockTestId` | `practiceMeta`, `answers[]` (`{questionId, selected, timeSpentSec, marked}`), `score`, `accuracy`, `percentile`, `rank`, `submittedAt`.
- **DailyContent** — `date`, `type` (`quiz`|`currentAffairs`|`vocabulary`|`miniTest`), `payload`.

## Scaling notes

- API is **stateless**: drop behind ALB / GCP LB and scale to N pods. Sticky sessions not needed.
- Hot reads (questions, daily content) cached in **Redis** (5–15 min TTL).
- Mock-test scoring is offloaded to a worker queue (BullMQ) when leaderboard recompute > 100 ms.
- Analytics events buffered client-side and POSTed in batches to `/v1/events`.
- MongoDB indexes: `{exam, subject, topic, difficulty}`, `{userId, submittedAt}`, `{date}`.

## Security

- Bcrypt password hashing (cost 12).
- JWT access (15 m) + refresh (30 d, rotating).
- Helmet, CORS allowlist, express-rate-limit per IP and per user.
- Admin routes gated by `requireAdmin` middleware.
- Input validation with `zod`.

## Offline mode

- Mobile app caches the last 500 practice questions and the active mock test in AsyncStorage.
- Submissions queued; flushed on reconnect.
