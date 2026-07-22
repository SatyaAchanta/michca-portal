# MichCA-Madness Implementation Plan

## Playoff Format Summary

- F40 uses a four-team Page playoff: 1 plays 2 for a direct finals spot, 3 plays 4 in an eliminator, then the 1v2 loser plays the eliminator winner for the second finals spot.
- T30 uses a top-eight quarter-final bracket after the extra game: 1v8, 2v7, 3v6, and 4v5.
- Premier T20 uses a single-pool top-eight knockout bracket: 6v3, 7v2, 5v4, and 8v1.
- Division 1 and Division 2 use two-pool brackets where ranks 2-7 play eliminators and each pool's rank 1 joins in the quarter finals.
- Division 3 uses a two-pool bracket where ranks 3-6 play eliminators and ranks 1-2 join in the quarter finals.

## Implementation

- Add bracket-specific Prisma tables for division setup, playoff seeds, bracket game slots, user entries, and user picks.
- Keep existing playoff `Game` rows as the source of truth for actual game results.
- Add template-driven bracket logic in `src/lib/michca-madness.ts` so every division is resolved from a fixed slot graph.
- Add `/admin/michca-madness` for admins and fantasy admins to enter seeds, schedule/link games, open submissions, and run the bracket update.
- Add authenticated `/michca-madness` for users to submit one full bracket per division and edit it until the first scheduled game starts.
- Add a home-page coming-soon announcement and navigation entry for MichCA-Madness.

## Validation

- Unit test the bracket templates, opening rounds, F40 loser path, and invalid winner rejection.
- Run targeted ESLint on all new/touched MichCA-Madness files.
- Run a production build to verify route and component integration.
