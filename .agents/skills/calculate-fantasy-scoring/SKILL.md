---
name: calculate-fantasy-scoring
description: Guidelines for calculating fantasy scoring within the admin UI. This includes best practices for reading CSV files, matching games, and updating scores. Use Playwright MCP for this workflow. The user wants to see the workflow happen in the UI.
---

## Instructions

When asked to score weekly fantasy games, assign winners for the games in the supplied CSV and calculate fantasy points for that specific week only. Do not update any week or game that is not represented in the CSV. This workflow updates the database through the admin UI.

1. Read the provided CSV file. If no CSV file is provided, ask the user to provide one. Ignore any of the YOUTH U-15 games. We dont conduct fantasy for those games.

2. Use the websites in this order:

- Locally first: `http://localhost:3000/admin/fantasy`
- Local login:
  - Username: read `FANTASY_SCORER_LOCAL_EMAIL`
  - Password: read `FANTASY_SCORER_LOCAL_PASSWORD`
- If the local instance is not running, run `npm run dev` in the project root.
- If local login succeeds but `/admin/fantasy` redirects away, check that the local user has an admin-capable fantasy role through the existing app/admin setup. The local account should be in the admin allowlist or have `ADMIN` / `FANTASY_ADMIN` access.
- Use production only after the local workflow is confirmed: `https://michcausa.org/admin/fantasy`
- Production login:
  - Username: read `FANTASY_SCORER_PROD_EMAIL`
  - Password: read `FANTASY_SCORER_PROD_PASSWORD`

3. Parse the CSV.

- Expected columns: `S No`, `Match Type`, `Date`, `Team One`, `Team Two`, `Result`, `Score Summary`.
- The CSV has no division column, so infer team identity from the team codes at the end of `Team One` and `Team Two`.
- Result parsing:
  - Text like `won by` means select that winner.
  - Text like `tie` or `draw` means select `Draw / Tie`.
  - Text like `abandoned`, `no result`, or `cancelled` means select `Abandoned`.
  - Unknown or ambiguous result text is a hard stop: report the row and ask the user before continuing.

4. Match the CSV to the UI week and games.

- Select the game week that matches the CSV dates. Confirm the exact CSV date range and the exact UI week label/key you see.
- Match each game using both teams together. Sometimes the two teams are reversed between CSV and UI, so check both combinations.
- Before making changes, report a reconciliation summary:
  - CSV row count.
  - UI games matched.
  - Missing CSV teams/games.
  - Extra UI games in that week.
  - Reversed matches.
  - Ambiguous matches.
- Hard stop and ask the user if the CSV dates do not match the UI week, any CSV game is missing, any team/game match is ambiguous, or any result cannot be parsed.

5. Confirm before local writes.

- Display a sample set of matched results for user confirmation.
- If the user approves, set the winners for the matched games in the local UI.
- If the user does not approve, stop and ask for the correct CSV file or corrected mapping.

6. Verify local results before production.

- After setting local winners, verify the target week's completed game count equals the CSV row count.
- Confirm the completed winner codes/results match the CSV-derived winners.
- Local prediction count may be zero; that must not stop winner assignment. Only use the prediction count to understand whether the final `Calculate Points` step will do anything.

7. Confirm before production writes.

- Before changing production, state the production target week, CSV row count, and the winner mapping summary.
- Ask for explicit user confirmation before applying production result buttons.
- In production, set only the CSV-matched games for that week.

8. Calculate points only for the target week.

- After production winners are set, scroll to the `Calculate Points` section and find the matching week.
- If the target week has a `Calculate Points` button and pending unscored predictions, ask for explicit confirmation before clicking it.
- If the target week has no `Calculate Points` button or says there are no unscored predictions, do not click any other week. Report that winners are assigned but there is no pending scoring action for the target week.

9. Verify and summarize.

- After scoring succeeds, verify the UI success message or preview state.
- Final response should only summarize the target week, games completed, players scored, and total points awarded.
- If no scoring action was available, summarize that winners were assigned or already assigned, and report the target week's pending scoring state.
