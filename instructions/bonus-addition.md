# Fantasy Bonus Addition Notes

## Goal

Add limited-time fantasy bonuses for selected game weekends. These bonuses make certain correct predictions worth more points and are intended to create weekly variety in the fantasy game.

## Current Understanding

- Home team is `team1`.
- Away team is `team2`.
- Bonuses apply only when the user prediction is correct.
- No two bonuses should stack with each other.
- A booster can still stack with one active bonus if the player chose to use a booster.
- Bonuses are weekend-specific and should not apply after that weekend.
- Already scored predictions should not be recalculated or changed.
- Bonus rules apply only when scoring unscored predictions for the active/scored weekend.

## Example Bonus Types

- Home game advantage: correct prediction for `team1` earns bonus points.
- Away game advantage: correct prediction for `team2` earns bonus points.
- Premier division bonus: correct prediction in every Premier division game earns bonus points.

## Scoring Model

Recommended formula:

```ts
basePoints = gameType === "PLAYOFF" ? 3 : 1;
bonusMultiplier = activeWeekendBonusMatches ? 2 : 1;
boosterMultiplier = prediction.isBoosted ? 3 : 1;

pointsEarned = basePoints * bonusMultiplier * boosterMultiplier;
```

Examples:

- Correct league pick with no bonus and no booster: `1`
- Correct home-team league pick during home bonus weekend: `2`
- Correct home-team league pick during home bonus weekend with booster: `6`
- Correct playoff pick during bonus weekend with booster: `18` if playoff base remains `3` and bonus applies.
- Wrong pick: `0`

## Suggested Initial Implementation

Start with code-configured weekly bonuses instead of admin-managed bonuses. This avoids a database migration and keeps the first implementation simple.

Example shape:

```ts
type FantasyBonusRule =
  | { type: "HOME_WIN"; multiplier: 2 }
  | { type: "AWAY_WIN"; multiplier: 2 }
  | { type: "PREMIER_GAME"; multiplier: 2 };

const WEEKLY_BONUSES: Record<string, FantasyBonusRule | undefined> = {
  "2026-W18": { type: "HOME_WIN", multiplier: 2 },
  "2026-W19": { type: "AWAY_WIN", multiplier: 2 },
  "2026-W20": { type: "PREMIER_GAME", multiplier: 2 },
};
```

The scoring engine can look up `WEEKLY_BONUSES[gameWeekKey]` inside `scoreGameWeekPredictions`.

## Matching Rules

- `HOME_WIN`: applies when `predictedWinnerCode === game.team1Code`.
- `AWAY_WIN`: applies when `predictedWinnerCode === game.team2Code`.
- `PREMIER_GAME`: applies when the game division is Premier, for example `game.division === "PREMIER_T20"`.
- Draw predictions do not receive home or away bonuses.
- Draw predictions could receive a future draw-specific bonus if desired, but that is not part of the current plan.

## Files Likely Involved

- `src/lib/fantasy.ts`: main scoring engine and best place for bonus helper functions.
- `src/lib/fantasy.test.ts`: scoring tests should cover each bonus type and booster interaction.
- `src/lib/actions/fantasy.ts`: likely no major changes unless the UI needs bonus data.
- `src/components/fantasy/fantasy-client.tsx`: optional, if displaying the active weekend bonus.
- `src/components/fantasy/prediction-card.tsx`: optional, if showing bonus labels on eligible games.

## UI Ideas

- Show a compact banner on the fantasy page for the selected/current weekend:
  - `This week: Home teams are 2x`
  - `This week: Away teams are 2x`
  - `This week: Premier games are 2x`
- On eligible prediction cards, show a small badge:
  - `2x Home Bonus`
  - `2x Away Bonus`
  - `2x Premier Bonus`

## Open Decisions

- Confirm whether playoff games should receive weekly bonuses or whether bonuses should apply only to league games.
- Confirm the exact multiplier for each bonus. Current assumption is `2x`.
- Decide whether bonus details need to be stored permanently with each prediction for audit/history.
- Decide whether admins should eventually manage weekly bonuses from the admin fantasy page.

## Recommended Path

1. Add scoring helper functions in `src/lib/fantasy.ts`.
2. Add code-configured weekly bonus map.
3. Update `scoreGameWeekPredictions` to apply at most one bonus.
4. Add tests for home, away, Premier, no-match, incorrect pick, and booster stacking.
5. Optionally add fantasy page messaging so users know the active weekend bonus before making picks.
