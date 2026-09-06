# Roadmap

## Phase 1 — Learning loop and mobile foundation (complete)

- Teach → See → Try → Understand → Review sequence
- Flexible 5, 10, or 20-card checkpoints with optional five-card continuation
- Complete Python/DSA and advanced System Design module paths
- Mobile bottom navigation and phone-safe layouts
- Track-specific mastery, bookmarks, confidence, and review queues
- Resumable local sessions
- Installable PWA metadata and offline shell

## Phase 2 — Activate accounts and sync (complete)

The production deployment now includes:

- a configured Supabase project and production redirect URLs;
- the versioned `learner_progress` migration and row-level security;
- passwordless email magic-link authentication; and
- browser-safe environment configuration in Vercel.

Acceptance criteria:

- A learner can sign in and resume on another device.
- Every learner can read and update only their own progress.
- Guest progress becomes the initial cloud record on first sign-in.
- Signing out leaves a usable local learning experience.

## Phase 3 — Adaptive review (complete)

- Schedule incorrect cards for near-term review.
- Increase intervals after correct recall.
- Balance new lessons with due review cards.
- Offer immediate mistake review at each checkpoint.
- [ ] Base mastery on delayed recall rather than lifetime accuracy alone.
- Add deterministic scheduler tests.

## Phase 4 — Curriculum tooling

- Validate schema and duplicate IDs automatically.
- Execute and verify output-prediction examples in isolation.
- Record objective, difficulty, owner, and review status per card.
- Preview proposed cards before merging.

## Phase 5 — Practice surfaces

- Safe, isolated Python exercises with resource limits
- Weekly mini-projects
- Interactive system-design component builder
- Scenario cards that introduce tradeoffs incrementally

## Optional AI tutor

Keep generative tutoring behind a provider interface. The core product must remain fully useful without an API key or model expense. A future provider may add alternate explanations or Socratic hints, but canonical answers stay curated and reviewable.
