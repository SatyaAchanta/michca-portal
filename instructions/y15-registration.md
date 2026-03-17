# 2026 Youth 15 Registration form

## Description

Note: This form should be filled by the Club President or Secretary:
Registration payments can be made via Zelle, Chase Quick Pay to micricketfinance@gmail.com
League Details:
Age Group: U15 (Players between 10–15 years old; cutoff date 09/01/2011)
Registration Fee: $1200 per team
Initial Deposit: $500 due by 03/31/2026 (full fee due 04/12/2026)
League starts: August 1st
Minimum Teams Required: 3
Minimum Games Guaranteed: 6 games per team
Game Day: Saturdays and/or Weekdays
Match Format: 20 overs per innings

## System requirements

- Use a new table for this called youth15-registration
- Bring up new path/route y15-registration for this form
- Page should be responsive both desktop and mobile

## Functional Requirements

- Description from above should go on top of this form. In mobile, this should be accordion and in desktop it can be fully displayed
- Club president or secretary can only fill this form. We don't have a way to determine that, but for now, make sure the user has to login to fill the form.
- Form fields
  - Club Name
  - President Name
  - President Email
  - President Phone Number
  - Secretary Name ~ if not existing, can use N/A. Display this as placeholder for secretary fields
  - Secretary Email
- Declaration:
  - DECLARATION: On behalf of the Club, I, hereby waive the rights to file any legal action in the court of law or ask for any monetary damages for any known or unknown reasons/conflicts that may arise from the activities of Mich-CA and its members. (Kindly type in your First and Last name as a form of signature).
  - So this declaration should be popped up as confirm when users submit their form. When chosen Confirm, the form should be submitted
- User should be able to make changes later. Every submit/re-submit should ask for confirmation
- Update Homepage announcement to include this message and link to youth 15 registration
  - In announcement, include deadline
- Also, add a new link in forms page. The link should go to top of the list.
- Make sure everything is responsive.
