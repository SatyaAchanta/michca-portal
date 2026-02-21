# Umpiring training registration

We want our future umpires in Mich-CA to register for training and pass the exam. For that, we need to provide a form to register, so that not only future umpires can register but also umpiring admin can see who all the people registered

# Requirements

1. Umpires should login with their email to access this page, lets called /umpiring-training. This page can be accessed by any user roles. We want all the players be able to register for. In a way every user who registered into platform is given default role called `Player`
2. Whenever user logs in to our app, we should ask for all user related data, the related user required values can be found from User table in `schema.prisma`
3. When we asking for user details, all the applicable fields should be populated with the data we receive from clerk auth. Users provide their email, firstname and lastname during signup
4. Once successfully authenticated, every user should be able to go to page `Umpiring training` from `More` menu in site nav
5. Now, umpiring training registration form should ask for these details

- First Name, Last Name (pre-populated from login information)
- contact number (required)
- email address (pre-populated from login)
- previously certified , boolean yer or no
- Mich-CA affiliation - text field to enter club's name ~ this is optional
- Preferred date - March 28th 2026 or March 29th 2026 - required
- Preferred Location - Troy or Farmington Hills - required
- Any Questions ? - optional
- Result ~ this will only seen by Admin role and they only be able to tweak and submit results
  - Regular logged in user shouldn't be able to see it

6. Create a new table `UmpiringTraining` and save all these result
7. Create an Admin page that lets admins to see list of all users who registered for umpiring training

# Technical things to keep in mind

1. Whenever someone registering for umpiring , make sure you check the user is authenticated when submitting request. The validation should happen on server side in corresponding `actions.ts`. Do not pass token from Client side to Server side actions. You should be able to pull clerkk token on server side, this is more secure approach. If you have any questions here, let me know
2. Use shadcnui elements only
3. Break components into testable components so that we add test coverage for these.
