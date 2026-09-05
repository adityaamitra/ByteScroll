# ByteScroll

> Trade scrolling for skill.

ByteScroll is a mobile-first learning feed that turns the reflex to consume short-form content into a focused Python practice habit. Each card takes under 90 seconds, asks the learner to make a decision before seeing the answer, and contributes to visible concept mastery.

This repository contains a working **Daily 10** prototype, a shared beginner Python curriculum, and a FastAPI foundation for server-side sessions and progress tracking.

## Why this project exists

Infinite feeds are exceptionally good at removing stopping cues. ByteScroll borrows their low-friction interaction model but changes the incentives:

- every card requires active recall;
- explanations appear only after an attempt;
- incorrect concepts can return through spaced repetition;
- progress is measured by mastery rather than time spent; and
- each session has a deliberate end.

## Current prototype

- Ten interactive Python foundation cards
- Concept, output-prediction, debugging, and quiz formats
- Immediate explanations and XP feedback
- Local progress, accuracy, concept mastery, levels, and streaks
- Responsive desktop and mobile layouts
- Shared JSON curriculum consumed by the web and API layers
- FastAPI endpoints for daily sessions, attempts, and learner progress
- SQLAlchemy persistence with SQLite locally and PostgreSQL support through `DATABASE_URL`
- Tests and GitHub Actions checks

## Product preview

The main experience is intentionally a finite feed:

1. See one focused concept or code sample.
2. Commit to an answer.
3. Read a short explanation.
4. Earn progress and move to the next card.
5. Stop after the Daily 10 completion screen.

## Tech stack

| Layer | Technology |
| --- | --- |
| Web | Next.js, React, TypeScript, CSS |
| API | FastAPI, Pydantic, SQLAlchemy |
| Data | SQLite for zero-config development; PostgreSQL-ready |
| Content | Version-controlled JSON curriculum |
| Quality | TypeScript, Pytest, GitHub Actions |

## Repository structure

```text
bytescroll/
├── apps/
│   ├── web/                 # Interactive Next.js prototype
│   └── api/                 # FastAPI service and tests
├── content/python/          # Shared, reviewable learning cards
├── docs/                    # Product, architecture, and roadmap
├── .github/workflows/       # Continuous integration
└── docker-compose.yml       # Optional local PostgreSQL
```

## Run the web app

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run the API

Requirements: Python 3.11 or newer.

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

The interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

Run the API tests with:

```bash
cd apps/api
pytest
```

### Optional PostgreSQL database

```bash
docker compose up -d postgres
export DATABASE_URL=postgresql+psycopg://bytescroll:bytescroll@localhost:5432/bytescroll
```

SQLite remains the default so contributors can run the API without Docker.

## API surface

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/v1/sessions/daily` | Return a deterministic daily set without answers |
| `POST` | `/api/v1/attempts` | Grade and persist an answer, then return feedback |
| `GET` | `/api/v1/progress/{learner_id}` | Aggregate XP, accuracy, and concept mastery |

## Design decisions

**A finite feed over infinite scroll.** ByteScroll provides the familiar feeling of “one more card” but restores a natural stopping point.

**Retrieval before explanation.** Learners must predict, debug, or choose before feedback appears. Recognition alone is not treated as mastery.

**Content is version controlled.** AI can help draft future cards, but the canonical curriculum is reviewable data—not unverified text generated at request time.

**Answers stay server-side in the API flow.** Daily-session responses omit the correct option and explanation. The current frontend also supports a zero-config local demo while the authenticated API integration is built.

## Roadmap

- [x] Daily 10 interactive prototype
- [x] Beginner Python card schema and starter curriculum
- [x] API grading and attempt persistence
- [ ] Authentication and cross-device sync
- [ ] SM-2-style spaced repetition queue
- [ ] Onboarding assessment and adaptive difficulty
- [ ] Safe, sandboxed code execution
- [ ] Curriculum authoring and review tools
- [ ] System design learning track
- [ ] Learning-outcome analytics and experiments

See [docs/ROADMAP.md](docs/ROADMAP.md) for acceptance criteria and sequencing.

## Contributing

Early contributions are welcome, particularly new card formats, accessibility improvements, and carefully reviewed beginner Python content. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

MIT © 2026 Aditya Mitra
