# Playoff Bracket

## Description

Play-off bracket , named "MichCA-Madness" that is similar to March Madness. There will be individual brackets for each division and below are the details of how each division play-off works. Our goal is to implement required functionality. Flag any tricky features/use-cases you think of before implementing. I created a new dir called "playoff-bracket", so write each plan into single corresponding file. When writing a plan, first summarize how you understood the playoff format for that division in simple words. That gives me confidence on the process

## Divisions and their playoff format type

Here are the below divisions and their formats. Initially ( meaning in pre-QFs stage ), for every format where I need to specifcy which teams advanced to playoffs, provide me a way in admin section to mention which all teams advanced to play-offs and which positions are they in. Once we are at QFs stage, our bracket automatically advances teams basing on obvious next game.

### F40

This playoff format is Page playoff system

Total 6 teams in league, 4 teams go to playoffs

- 4 teams will go Play-offs
- Game 1: Teams positioned in 1 & 2 will play first play-off game, winner goes to finals.
- Game 2: Teams positioned in 3 & 4, losing team is out of competititon, winner team advances to Game 3
- Game 3: Loser of Game 1 vs Winner of Game 2 plays another play-off game - losing team is out of competition, winning team advances to Game 4
- Game 4: Winner of Game 1 vs Winner of Game 3

### T30

Total 17 teams in the league

- All 17 teams will play 8 games where ODD number teams will play against EVEN number with few exceptions ( this is just data point for league games, this wont carry to playoffs)
- After the league games, team will be ranked 1-17. Rank 1 team will qualify to QFs. Rank 2-17 will play 9th game
- After the 9th game, team will be ranked 2-17. ( Here provide me a way to select teams from ranks 2-8, may be in admin section)
- Rank 2-8 will move to QF to meet with previously ranked 1 team QF format and teams ranked from
- In QFs, Rank 1 vs 8, Rank 2 vs 7, Rank 3 vs 6 and Rank 4 vs 5

### PREMIER_T20

Here is the playoff-format visual. Create a plan basing on that

[Premier Playoff formar](./playoff-bracket/premier-playoff-format.png)

### DIV1_T20

Here is the playoff-format visual for this division. Create a plan basing on that

[Div1-playoff-format](./playoff-bracket/div1-playoff-format.png)

### DIV2_T20

Here is the playoff-format visual for this division. Create a plan basing on that

[Div2-playoff-format](./playoff-bracket/div2-playoff-format.png)

### DIV3_T20

Here is the playoff-format visual for this division. Create a plan basing on that

[Div3-playoff-format](./playoff-bracket/div3-playoff-format.png)

## Requirements

- We need new page `/michca-madness` where users can submit their own bracket.
- Users need to login to submit predictions and only 1 full bracket can be submitted from one account
- Design should be responsive between mobile and desktop versions, from the knowledge you have, come up with best design choices. Use existing design choices and if you have to bring in any new package, ask for my approval by telling why we need package
- Create a very exciting and eye catching home page announcement for MichCA-Madness saying coming soon ( I will post update when its ready )
- User should be able to see their bracket and change predictions till 1st game starts.
- After game 1 starts, if the prediction is correct, we indicate that card in one way and wrong in other way
- Once user predicts 1 game wrong , they are out of race
- Show a leaderboard displaying who all are still in the race
- We need admin screen to enter teams who advanced to play-offs and also which games are scheduled when. So , we need a way to enter the teams and also mention where the games are happening. This admin screen will be separate from existing fantasy scoring
- in Admin page, we also need "Update Bracket" button that goes through each division bracket. This is where I need your help/suggestion to determine whether we need to calculate each user's bracket or would we just update games' results so that users brackets are automatically updated.
- We need Rules section in this page that indicates rules of bracket. Write rules for now what all you learned. I will updated later if required.

## Rules

- Users should be able to submit 1 bracket for each division for same account
- Users should be logged in to submit predictions, so this page will be behind the auth
- leaderboard should display users who got all predictions so far. Exclude users who got at least one game wrong.
