# Roadmap

## Phase 0 — Product prototype (complete)

- Mobile-first Daily 10 interface
- Ten reviewed Python foundation cards
- Four active-learning card formats
- Local XP, accuracy, mastery, and streak tracking
- Completion screen and finite session boundary
- Server-side grading API foundation

## Phase 1 — Real accounts and synced progress

Acceptance criteria:

- A learner can sign in and resume on another device.
- The frontend receives cards without answer data.
- Every submitted attempt is idempotently persisted.
- A completed session is counted once per learner and date.
- Local prototype progress can be imported or intentionally discarded.

## Phase 2 — Spaced repetition

Acceptance criteria:

- Incorrect cards receive a near-term review date.
- Correct cards return at increasing intervals.
- Daily sessions balance review cards and new material.
- The scheduler is covered by deterministic unit tests.
- Mastery is based on delayed recall, not lifetime accuracy alone.

## Phase 3 — Curriculum tooling

Acceptance criteria:

- Contributors can validate all content locally.
- Output-prediction examples are checked in an isolated test process.
- Every card has an owner, learning objective, difficulty, and review status.
- A preview route renders a proposed card before merging.

## Phase 4 — Safe coding exercises

Acceptance criteria:

- Learner code runs outside the web and API hosts.
- CPU, memory, wall-time, filesystem, and network access are restricted.
- Test output is normalized into beginner-friendly feedback.
- Abuse limits and observability exist before public release.

## Phase 5 — System design track

Introduce scenario cards only after the Python habit loop is validated. System design cards should focus on tradeoffs rather than trivia and build diagrams incrementally from concrete requirements.

Examples:

- choose the first bottleneck to investigate;
- compare cache placement options;
- estimate storage or request volume;
- identify a failure mode; and
- extend a simple architecture under a new constraint.
