# Contributing to ByteScroll

Thank you for helping make short-form learning more useful and responsible.

## Before opening a pull request

1. Keep each change focused.
2. Run `npm run typecheck` and `npm run build` for web changes.
3. Run `pytest` from `apps/api` for API changes.
4. Explain the learning objective of any new curriculum card.
5. Verify Python examples against Python 3.11 or newer.

## Content checklist

A learning card should:

- test one primary idea;
- use plain language suitable for a beginner;
- include one unambiguously correct option;
- explain why the answer is correct;
- avoid trick questions unless the misconception itself is being taught; and
- fit comfortably on a phone without excessive scrolling.

Do not add unreviewed, runtime-generated content to the canonical curriculum.

## Commit style

Use short, imperative commit messages such as:

```text
Add string slicing review cards
Fix progress hydration on mobile
Validate duplicate curriculum IDs
```

## Pull requests

Include:

- what changed;
- why it improves learning or maintainability;
- how it was tested; and
- screenshots for visible interface changes.
