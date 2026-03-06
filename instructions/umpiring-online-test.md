# Umpiring Online Test

I want to introduce new online umpiring test on this website where only can login and submit answers to the questions

## Functional Requirements

### Where do we get questions and answers from ?

- User with role called `ADMIN` will be able to enter questions and answers for the test. These are multiple answer questions where only one answer is correct
- `ADMIN` should be able to manage questions in new admin page. Managing questions include admin can create, edit and delete questions or answers
- Admins can mark questions active or inactive. Only active questions can be considered for the test
- All the required schema for this question and answers don't exist yet

### What is test format and how long test takes ?

- Test format is 20 questions 30 minutes
- There could be more than 20 questions available from question pool that admin creates, but test takers ( who are users with PLAYER role ) should only get 20 random questions out of the pool. Order of questions should also need to be random
- Test ends when user click "Finish Test" and ask for confirmation , and if user says "YES, Finish", test should be ended
- After the test is ended, results should be calculated right away. Answers the users selected for the questions should be compared against actual set of questions
- Test timer should be displayed all the time from start to end
- User should be able to go back and forth on the questions
- Users can also flag the questions so that they can come back to the flagged questions later

## What are pass and fail scenarios ?

- Once the test is ended, answers should be calculated right away
- Users who score greater than or equal to 80% of their questions should be considered as PASS, all others should be considered as FAIL

### How does test start and end ?

- Admins should be able to select the location, today's date and start the test
- Admins who started the test details should also be stored
- Once the test is started, all the users who registered with that corresponding location can go to `umpiring-certification` page and START/END the test
- Once the test is ended, user cannot hit start test again. So question for you, how can we correlate only one test for that day ? Englighten me here please

## System requirements

- As a test host we should be able to track test id, what all the questions user got and in which order, what is start and end time
- Each users test should have a unique ID and later this data can be used to display on their `/account` page , which is yet to be built
- Our platform ( webpage ) should be able to host 100 users at a time to take the test. If you need any clarifications here, let me know
- is this something that is automatically handled by neon pooled connection ? or should we do something else here ?
- Once after the test is ended, user cannot start another test on same day

## Notes for coding AGENT

- We might not have all schemas/tables we need at the moment. So you might have to create things as required
