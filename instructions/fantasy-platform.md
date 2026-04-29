# Plan: Fantasy Prediction Platform (4-5 hour MVP)

## Context

- App: michca-portal (Next.js App Router, Prisma/PostgreSQL, Clerk auth, Tailwind/shadcn)
- `gameType` (LEAGUE/PLAYOFF) already exists on Game model
- No existing prediction/fantasy models
- External fantasy URL currently linked from `fantasy-banner.tsx` → replace with /fantasy

## Points Rules

- Correct winner, league game: +1 pt
- Correct winner, playoff game: +3 pts
- Booster activated: 3x multiplier on correct prediction (e.g., 1 → 3 or 3 → 9)

## Booster Rules

- 10 boosters per season
- Only unlocked after achieving Level 1

## Level System (participation-based)

- Level 1: fully predicted all league games in 2 game-weeks → +2 bonus pts
- Level 2: 4 league game-weeks → +4 bonus pts
- Level 3: 6 league game-weeks → +6 bonus pts
- Level 4: 8 league game-weeks → +8 bonus pts
- Level 5: 10 league game-weeks → +10 bonus pts
- Level 6: 12 league game-weeks → +12 bonus pts
- Level 7: 14 league game-weeks → +14 bonus pts
- Level 8: 16 league game-weeks → +16 bonus pts
- Playoff games score points but do not count toward level progress
- Level bonuses are one-time (tracked to avoid re-awarding)

## Scoring Trigger (Admin-controlled)

- Admin marks games COMPLETED (existing flow)
- Admin goes to /admin/fantasy, sees completed-but-unscored games grouped by game-week
- Admin clicks "Calculate Points" for a game-week batch
- System scores all predictions for that batch, updates user totals + levels

## What is a game week and how is it important ?

- Participants should only be able to predict SCHEDULED games those are happening upcoming one weekend.
- Generally games happen on both Saturday and Sunday
- Participant shouldn't be able to change their prediction after 9 AM Saturday morning for Saturday Games and 7 AM Sunday morning for Sunday Games

---

## Implementation Plan

### Phase 1: Schema & Migration (~30 min)

1. Add `Prediction` model to prisma/schema.prisma:
   - id, userProfileId (FK → UserProfile), gameId (FK → Game)
   - predictedWinnerCode (String?) — null = predict draw
   - isBoosted (Boolean @default(false))
   - isScored (Boolean @default(false))
   - isCorrect (Boolean?) — null until scored
   - pointsEarned (Int?) — null until scored
   - createdAt, updatedAt
   - @@unique([userProfileId, gameId])
2. Add to UserProfile:
   - fantasyPoints Int @default(0)
   - boostersRemaining Int @default(0) — set to 10 on Level 1 achievement
   - fantasyLevel Int @default(0)
   - fullParticipationWeeks Int @default(0) — tracks full-participation weeks count
   - levelBonusesAwarded Int @default(0) — tracks highest level bonus awarded (0-5)
3. Add `predictions` relation to Game model
4. New Prisma migration: `20260429_add_fantasy`

### Phase 2: Core Library (~30 min)

5. Create `src/lib/fantasy.ts` with:
   - `getPointsForGame(gameType: GameType, isBoosted: boolean): number` — pure function
   - `scoreGameWeekPredictions(gameWeekKey: string): Promise<void>` — server-side scoring engine:
     - Fetch all completed, unscored predictions for that game-week
     - For each prediction: check correctness, compute points
     - Update Prediction (isScored, isCorrect, pointsEarned)
     - Batch-update UserProfile (fantasyPoints += earned)
     - Check full-participation: did user predict ALL league games in that week? If yes, increment fullParticipationWeeks
     - Recalculate level: every 2 full league weeks = +1 level (capped at 8)
     - Award level bonus points if level increased (use levelBonusesAwarded to prevent double-award)
     - If new level = 1, set boostersRemaining = 10
   - `getGameWeekKey(date: Date): string` — returns ISO week string like "2026-W18"
   - `getLevelFromWeeks(weeks: number): number` — pure function: floor(weeks/2), capped at 8

### Phase 3: /fantasy Prediction Page (~1 hour)

6. Create `src/app/fantasy/page.tsx`:
   - Auth guard: redirect to /sign-in if not logged in
   - Show upcoming/scheduled games grouped by game-week
   - For each game: team cards with radio picker (Team A | Draw | Team B)
   - Booster toggle per game (only if user has boosters remaining AND Level 1+)
   - Submit prediction server action (locked once game is LIVE/COMPLETED)
   - Show user's existing predictions if already submitted
   - Display user's stats: total points, level badge, boosters remaining
7. Create `src/lib/actions/fantasy.ts` with server actions:
   - `submitPrediction(gameId, predictedWinnerCode, isBoosted)` — validates lock state, upserts Prediction
   - `getUserFantasyStats(userProfileId)` — returns points, level, boosters, predictions

### Phase 4: Leaderboard (~45 min)

8. Create `src/app/fantasy/leaderboard/page.tsx`:
   - Fetch all UserProfiles with fantasyPoints > 0, ordered by points desc
   - Show rank, name, team, points, level badge
   - Highlight current user's row
9. Create reusable `src/components/fantasy/level-badge.tsx` — displays level number + color/icon

### Phase 5: Admin Calculate Page (~45 min)

10. Create `src/app/admin/fantasy/page.tsx` (ADMIN role gated):
    - List game-weeks that have completed games with unscored predictions
    - "Calculate Points" button per game-week → calls `scoreGameWeekPredictions()`
      - In here make sure even the wrong scoring can be corrected just for one single game
      - so provide a way to correct game scorings
    - Show confirmation with points distributed count
11. Add admin nav link to /admin/fantasy

### Phase 6: Wiring & Polish (~30 min)

12. Update `src/components/fantasy-banner.tsx`: change href from `NEXT_PUBLIC_FANTASY_URL` to `/fantasy`
13. Add fantasy stats section to `/account` profile page (points, level, predictions history)
14. Add `/fantasy` to navbar/header navigation

---

## Relevant Files

- `prisma/schema.prisma` — add Prediction model + UserProfile fields
- `src/components/fantasy-banner.tsx` — update link to /fantasy
- `src/lib/fantasy.ts` — NEW: scoring engine
- `src/lib/actions/fantasy.ts` — NEW: server actions
- `src/app/fantasy/page.tsx` — NEW: prediction UI
- `src/app/fantasy/leaderboard/page.tsx` — NEW: leaderboard
- `src/app/admin/fantasy/page.tsx` — NEW: admin calculate
- `src/app/account/page.tsx` — update to show fantasy stats

## Decisions

- Game weeks derived from ISO week of game date (no new DB field needed)
- Predictions locked when game.status = LIVE or COMPLETED
- Draw prediction: predictedWinnerCode = null (Game's isDraw flag used for scoring)
- Booster unlocked at Level 1 (fullParticipationWeeks >= 2), 10/season
- Level bonuses one-time; tracked via levelBonusesAwarded field
- No real-time updates — page refresh only (v1 scope)
- /fantasy replaces external fantasy link

## Out of Scope (v1)

- Auto-scoring on game completion
- Real-time leaderboard
- Prediction streak tracking
- Admin ability to set games as "playoff" (already on Game model via gameType)
