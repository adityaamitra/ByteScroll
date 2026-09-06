# ByteScroll

> Trade scrolling for skill.

[**Try the live app →**](https://bytescroll.vercel.app)

ByteScroll is a mobile-first learning feed that replaces passive morning scrolling with short, structured Python and system design lessons. Every session teaches first, shows a concrete example, asks the learner to try, explains the result, and pauses at a learner-chosen checkpoint.

## Why ByteScroll

Infinite feeds remove stopping cues. Traditional learning tools often add too much activation energy. ByteScroll borrows the ease of short-form content while changing the loop:

```text
Learn → See → Try → Understand → Review → Stop
```

- Lessons take seconds to begin.
- Explanations come before fair, focused questions.
- Wrong answers generate targeted feedback and a review item.
- Python and system design maintain independent mastery paths.
- Sessions start with 5, 10, or 20 cards, then continue in optional five-card blocks.

## Current experience

- Mobile-first learning interface with persistent bottom navigation
- Python and System Design track switching
- 18 modules and 164 curated cards across both paths
- Python from variables through OOP, data structures, algorithms, and dynamic programming
- System Design from requests through data, scaling, distributed systems, reliability, security, and case studies
- Teaching, worked examples, quizzes, and review cards
- Progressive hints and misconception-specific feedback
- Confidence check after each answer
- XP, levels, streaks, accuracy, activity, and concept mastery
- Resumable sessions, configurable checkpoints, unlimited continuation, and bookmarked cards
- Adaptive queues: missed cards return sooner and successful recall increases the interval
- First-run learning preferences
- Installable PWA with offline shell support
- Device-local progress with optional Supabase account sync
- FastAPI endpoints for server-side sessions, grading, and progress aggregation
- No generative AI dependency or AI usage cost

## Tech stack

| Layer | Technology |
| --- | --- |
| Web | Next.js, React, TypeScript, CSS |
| Accounts and sync | Optional Supabase Auth + PostgreSQL with row-level security |
| Learning API | FastAPI, Pydantic, SQLAlchemy |
| Content | Version-controlled JSON foundations and typed course modules |
| Quality | TypeScript, Pytest, GitHub Actions |
| Deployment | Vercel |

## Repository structure

```text
bytescroll/
├── apps/
│   ├── web/                         # Next.js PWA
│   └── api/                         # FastAPI service and tests
├── content/
│   ├── python/learning-path.json
│   └── system-design/foundations.json
├── supabase/migrations/             # Secure progress-sync schema
├── docs/                            # Product and architecture notes
└── .github/workflows/               # Continuous integration
```

## Run the web app

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Accounts are optional; progress works locally without environment variables.

## Enable login and cross-device sync

ByteScroll uses guest mode until Supabase is configured.

1. Create a Supabase project.
2. Run `supabase/migrations/001_learner_progress.sql` in its SQL editor.
3. Configure email magic links and, optionally, Google OAuth in Supabase Auth.
4. Add local and production URLs to the allowed redirect URLs.
5. Copy the environment template and add the project values:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Only the project URL and browser-safe publishable key belong in `NEXT_PUBLIC_*` variables. The older `NEXT_PUBLIC_SUPABASE_ANON_KEY` name remains supported for existing deployments. Never expose a Supabase secret or service-role key; row-level security restricts every progress record to its authenticated owner.

## Run the API

Requirements: Python 3.11 or newer.

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

Interactive documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

```bash
pytest
```

## API surface

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/v1/catalog` | List both complete course paths and their modules |
| `GET` | `/api/v1/sessions/daily?track_id=python` | Return an ordered starter session without answers |
| `POST` | `/api/v1/attempts` | Grade and persist an answer |
| `GET` | `/api/v1/progress/{learner_id}` | Aggregate XP, accuracy, and mastery |

## Product principles

**Teach before testing.** A beginner should never feel that ByteScroll is examining knowledge it did not explain.

**Earn attention; do not trap it.** Checkpoints are explicit, streaks are non-punitive, and continuing is always the learner's choice.

**Measure retention, not taps.** Review queues and delayed recall matter more than raw time in the app.

**Keep content reviewable.** The current tutor experience uses curated explanations, hints, and targeted feedback. Generative AI is an optional future adapter, not a requirement.

## Roadmap

- [x] Teach-before-quiz sessions with flexible checkpoints
- [x] Mobile navigation and responsive learning surface
- [x] Full Python/DSA and advanced System Design learning paths
- [x] Progress dashboard, activity tracker, and session resume
- [x] Adaptive spaced-repetition scheduling and mistake review
- [x] Installable PWA
- [x] Optional Supabase authentication and sync foundation
- [ ] Connect the deployed project to Supabase
- [ ] Safe sandboxed Python exercises
- [ ] Weekly mini-projects
- [ ] Interactive system-design builder
- [ ] Optional provider-based AI tutor

See [docs/ROADMAP.md](docs/ROADMAP.md) for acceptance criteria.

## License

MIT © 2026 Aditya Mitra
