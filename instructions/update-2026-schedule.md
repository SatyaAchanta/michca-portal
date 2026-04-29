# Update Schedule

We have all the teams and their schedule. I want us to read the csv file mentioned below and update the schedule in the database.

Write a script either in Typescript or python to update records in my database. You decide which language suits best. Also, you have connection strings and such in .env.local file. Ask me if you need clarification. I need to use this script later to add more play off games

## Instructions

- I see that we already have Game and Team tables existing in schema. So reading `michca-2026-schedule.csv` file, I want you to parse the file by keeping below `Conditions` in mind.
- Run `Dry Run` and give me total count of games, first 5 games with latest game first as an output so that I can confirm
- All the games happening in EST ( Detroit time ), so if you have to store game date and times in UTC and parse it to EST for displaying, do whatever you like, but make sure game dates and times are displayed in correct time and timezones
- Extracting team code from the csv and mapping it to our team code in our current database involves multiple columns. I will add details in `Team Code Extraction`
- CSV file columns
  - Match Type ~ Leaguie/Playoff ~ we already have this in our schema
  - Date - YYYY-MM-DD
  - Time - Scheduled start time in EST
  - Team One ~ full team name along with code in it.
  - Team Two ~ full team name along with code in it. Team One and Team Two supposed to be different. if you find both are same, let me know
  - Venue ~ This is one of the grounds we have in our grounds in `src/lib/data.ts`. So You can use same ground name, but display it as a link with address from `src/lib/data.ts`. At first confirm me list of mappings between grounds from csv file and list of grounds from our codebase. You should be able to establish mapping this with names of the grounds between csv and our codebase. If in csv you see a ground name that is not part of our codebase, ask me what to do.
  - League
    - includes league name in this format `2026 <league_name>`. For example: `2026 F40 & T30`, `2026 T20`
    - When extracting team codes, we can exclude this column for F40 and T30 Teams in division, but consider this for T20.
    - More coming in `Team Code Extraction` section
- Division
  - this is what decides what divison team is playing in. We already have enum for division in our schema, lets use that. Make sure you map things correctly
  - If you need help/clarification in mapping, let me know
- Ignore rest of the columns in the CSV
- If in Schema, any other columns are required those are not in CSV, ask me what to do

## Team Code Extraction

- Right now in our database, teamcodes are stored in the format of <league_code>-<Team_Code>
- for <league>, T20 teams uses `T20` league code. F40 & T30 teams use correspoinding division as league code.
  - For example, establish league code for `T20` team includes if you find `T20` word in league column, then use `T20`. If you find `F40 & T30` word in league, then use corresponding division as league code. In this case, F40-<Team_Code> and T30-<Team_Code>
- For team code, you can extract last four characters of team names from team one and team two columns
  - So Team One has one league code associated with it in our database
  - Team Two has one league code assiociated with it in our database
