# SSC Saathi

A modern, full-featured **SSC Exam Preparation App** for Android and iOS with a powerful, scalable backend.

> Note: This repository was originally named `vyapar-saathi`. It now hosts the SSC Saathi platform.

## Features

- **Unlimited Question Bank** across SSC CGL, CHSL, MTS, GD, CPO, JE, Stenographer
  - Subjects: Quantitative Aptitude, Reasoning, English, General Awareness, Current Affairs
  - Difficulty levels: Easy / Medium / Hard
  - PYQs (Previous Year Questions), topic-wise & chapter-wise practice
  - Each question carries answer, detailed explanation, short tricks, solution steps
- **Real SSC Mock Tests** — exam-like CBT interface, timer, negative marking, sectional cut-offs, randomized questions
- **AI Smart Practice** — weak-topic detection, personalized recommendations, dynamic question generation, daily targets
- **Analytics Dashboard** — accuracy, speed, percentile, rank, weak-area heatmap, progress graphs
- **Daily Features** — daily quiz, current affairs, vocabulary, mini-tests, weekly grand tests
- **Premium UX** — dark mode, Hindi + English, bookmarks, offline mode, downloadable PDFs/notes, leaderboard, doubt section, video solutions, voice search
- **Secure Auth** — email, phone OTP, Google login (Firebase / Auth0 ready)

## Architecture

| Layer | Stack |
|------|------|
| Mobile | React Native (Expo) — iOS + Android from one codebase |
| Backend | Node.js + Express, REST API |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + Firebase social login |
| Admin Panel | React + Vite |
| Cloud | AWS / GCP ready (stateless API, horizontal scaling) |
| AI | Pluggable provider (OpenAI / Bedrock / local) for recommendations & question generation |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for details.

## Repository Layout

```
backend/   Node.js + Express + MongoDB API
mobile/    React Native (Expo) app
admin/     React + Vite admin panel
docs/      Architecture & API docs
```

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env       # set MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed               # load sample SSC questions
npm run dev                # http://localhost:4000
```

### Mobile (Expo)

```bash
cd mobile
npm install
npm start                  # press i for iOS, a for Android, w for web
```

### Admin Panel

```bash
cd admin
npm install
npm run dev                # http://localhost:5173
```

## Default Admin

After seeding, log in to the admin panel with:

- email: `admin@sscsaathi.app`
- password: `admin@1234`

(Change immediately in production.)

## License

MIT
