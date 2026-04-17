# Club Info

A new form on path `/club-info` so captain of each club enters their info. Only Captain enters but not vice-captains

## Instructions

- Implement new form that accepts below information
  -- Email Address ( will be prepopulated from their account info, so shouldn't be edited)
  -- Name of the captain
  -- Cricclubs Profile ID
  -- Contact Number ( lets take this contact number from this form, and also store in the UserProfile information )
  -- T20 Division
  --- Similar to waiver form, lets ask for which division their team is in and display all the teams dropdown basing on the division selection
  -- F40 or T30 Division
  --- Similar to waiver form, lets ask for either F40 or T30 and display teams in dropdown to pick one basing on F40 or T30

  -- Similar to waiver form, A user can be captain for below scenarion
  --- T20 Team Alone
  --- F40 or T30 team, but not both
  --- T20 and F40 Teams
  --- T20 or T30 teams
  -- Consider a user declares themselves as captain of a team, lets connect this with UserProfile and Teams tables so that
  --- We can display Captain Information on individual team page
  --- We can display Captain badge on Account page

  -- Admin Section updates:
  --- Dispaly new section called `Club Info`
  --- In this section, display all clubs and captains who submitted the details
  --- Also, provide filters to search basing on Club name
  --- When Admin searches basing on club name, they should see both club info and captain info as well.
  --- If you feel providing extra dialog or such for more info on a club is helpful, feel free to make better design choice here
  --- Lets add new role called STATS_COMMITTEE_EMAIL_ALLOWLIST so that either Admins with this role or ADMIN_EMAIL_ALLOWLIST can see this page. Not any other Admins

- Add required testing wherever applicable
- Provide a way to export all this club info submissions into Excel sheet in this Admin section
- For now, this is private form, so no links added anywhere in any Navs.

## System requirements

- Make sure this feature is both desktop and mobile compatible
- Add required validations on fields as per their purpose. For example - email, contact number

## Note

- Clarify all your questions before implementing
