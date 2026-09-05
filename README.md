# ByteScroll

> Trade scrolling for skill.

[**Try the live app →**](https://bytescroll.vercel.app)

ByteScroll is a mobile-first learning feed that replaces passive morning scrolling with short, structured Python and system design lessons. Every Daily 10 session teaches first, shows a concrete example, asks the learner to try, explains the result, and ends on purpose.

## Why ByteScroll

Infinite feeds remove stopping cues. Traditional learning tools often add too much activation energy. ByteScroll borrows the ease of short-form content while changing the loop:

```text
Learn → See → Try → Understand → Review → Stop
```

- Lessons take seconds to begin.
- Explanations come before fair, focused questions.
- Wrong answers generate targeted feedback and a review item.
- Python and system design maintain independent mastery paths.
- The feed ends after ten cards.

## Current experience

- Mobile-first Daily 10 interface with persistent bottom navigation
- Python and System Design track switching
- Teaching, worked examples, quizzes, and review cards
- Progressive hints and misconception-specific feedback
- Confidence check after each answer
- XP, levels, streaks, accuracy, activity, and concept mastery
- Resumable sessions and bookmarked cards
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
| Content | Version-controlled JSON curricula |
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

Only the public project URL and anon key belong in `NEXT_PUBLIC_*` variables. Row-level security restricts every progress record to its authenticated owner.

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
| `GET` | `/api/v1/sessions/daily?track_id=python` | Return an ordered Daily 10 without answers |
| `POST` | `/api/v1/attempts` | Grade and persist an answer |
| `GET` | `/api/v1/progress/{learner_id}` | Aggregate XP, accuracy, and mastery |

## Product principles

**Teach before testing.** A beginner should never feel that ByteScroll is examining knowledge it did not explain.

**Earn attention; do not trap it.** Sessions are finite, streaks are non-punitive, and the final card explicitly gives the learner permission to leave.

**Measure retention, not taps.** Review queues and delayed recall matter more than raw time in the app.

**Keep content reviewable.** The current tutor experience uses curated explanations, hints, and targeted feedback. Generative AI is an optional future adapter, not a requirement.

## Roadmap

- [x] Teach-before-quiz Daily 10
- [x] Mobile navigation and responsive learning surface
- [x] Python and System Design foundations
- [x] Progress dashboard, activity tracker, and session resume
- [x] Installable PWA
- [x] Optional Supabase authentication and sync foundation
- [ ] Connect the deployed project to Supabase
- [ ] Adaptive spaced-repetition scheduling
- [ ] Safe sandboxed Python exercises
- [ ] Weekly mini-projects
- [ ] Interactive system-design builder
- [ ] Optional provider-based AI tutor

See [docs/ROADMAP.md](docs/ROADMAP.md) for acceptance criteria.

## License

MIT © 2026 Aditya Mitra
