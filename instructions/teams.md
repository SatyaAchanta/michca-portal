# Teams

Create teams basing on the document `michca-2026-all-teams.csv` in this directory

## Instructions

- You see a comma separated rows in this file. Each row is divided into four values: Format, Division, TeamShortCode and TeamName
- Using these values store these teams to our database. No table existing for teams yet, so we have to create new one.
- For identifying team, we need to create unique team identifier. This is different from database unique ID on the column, this team unique identifier `TeamCode` is comprised if `<format>-<teamshortcode>`. For example: the team code will be `T20-DARI`, `F40-ODCC`, `T30-MOCC`, `YOUTH-PCAS`. Let me know if you have any questions here
- These are the below columns I want us to have in our database so that later captains (role yet to be created, so I will take care of it later ) can enter teams details.
  -- Format
  -- Division
  -- TeamShortCode
  -- TeamCode ( what we disucssed TeamCode above )
  -- TeamName
  -- Description
  -- Captain ( this is user profile in this database )
  -- Vice Captain ( this is user profile in this database )
  -- Facebook page
  -- Instagram page
  -- Logo

- We save all these above details so that we can display specific page for each team. So, in new path `team/<teamcode>`, we pull all the details from the team and display it on the page. For now, only user with Admin role can update it. Later we will add new role called Captain and allow them to do it
- Create new Menu Nav link called `Teams` so that page visitors can see list of all teams
- Add link to `Teams` in schedule page as well
- Admin should be able to see list of teams in their page.
  -- Switch Admin page into dropdown fashion so that Admin can select which section they want to see and we can display such admin section basing on selection. Right now its all in one page and sort of bad user experience
