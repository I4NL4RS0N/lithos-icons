# CLAUDE.md

Read `SPEC.md` before any work. It is the source of truth for decisions, data model, design rules and agent guardrails.

## Hard rules
- Concept IDs and icon file paths are permanent. Never rename or delete — deprecate with `replacedBy`.
- Never publish held standards (GICS, ICB, BICS, TRBC, Fitch, Moody's, S&P). Don't edit `standards-private/` or set `publish: true` on held schemes.
- Icons use `currentColor` only. Flags are the only coloured assets.
- Each size (16/20/24/32/48) is drawn separately from the 24px master. Never scale an SVG to make another size.
- Outline icons keep live strokes (round caps/joins) so stroke width stays adjustable.
- Reuse metaphors from `data/metaphors.json` before inventing new ones.
- Every icon change must pass the validator and visual regression before merge.
- Every PR includes rendered previews (all sizes, both styles).

## Current milestone
M0 → M1 (pilot). See SPEC.md §13.
