# Waiver form

Waiver form for 2026. Players fill in the form

## Instructions

1. Every user who fills the form should be logged in.
2. Page has some content that I provide in `Page Content` section below
3. Below are the values user has to fill in the form:
   - Player name as in Cricclubs
   - Player Cricclubs ID
   - City
   - Social Media Account Name for Tagging. Facebook or Instagram Account
   - T20 Dvision - We pick list of all unique divisions from Teams list
     - When they select division, corresponding teams list should be provided to select only one team. For example: If the user selects Premier division, then only list of Premier division teams should be provided and only one among them can be chosen, field name is Team Name ( <division_selected> )
   - F40 or T30 Division
     - Now here, a player can be part of any 1 T20 division ( premier or division-1/2/3 ) and either of (F40 or T30). So one can play Division 1 and play T30 but not F40 and T30
     - same like above selecting either F40 or T30 should bring up list of teams applicable and select one among them
   - Youth
     -- ignore this division for now from Waiver form

4. All these submissions should be recorded in their database after they submit and also should be shown on the account information.
   - When they submit, we should ask for confirmation saying below `Submit Content` in confirmation dialog along with today's date
   - if the user submits the waiver form, account page should show date and time they submitted. If they haven't submitted a form yet, we should provide link to waiver form `/waiver`

5. Admin Page
   - Right now Admin page displays both Youth team registrations and Umpiring assignments in same page. Extract this to tabbed approach so that Admins can select which Admin Section they want to see.
   - Also, now lets add `Waiver Status` to the list of secitons in dropdown so that Admins can see who all submitted waiver forms
   - Admins should be able to filter waiver status based on `Team Name`, `Division` and `Player Name` ( in our case this is user name )
   - Admins should also be able to export them into PDF or excel sorted in this order: Division (Desc) -> Team Name (ASC) -> User name (ASC)
   - Display total number of waivers submitted in the Admin page. The count should be updated as the filters updated

6. Page Content

```
## THIS IS AN IMPORTANT LEGAL DOCUMENT. PLEASE READ CAREFULLY BEFORE SIGNING.

In consideration of my acceptance into the Mich-CA 2026 League, I, on behalf of myself and my heirs, executors,
administrators, trustees, and successors in interest, hereby fully and forever waive, release, and discharge any and all
rights, claims, demands, causes of action, or liabilities of any kind, including but not limited to claims arising from
negligence, premises liability, emotional distress, personal injury, property damage, or any other tort or statutory claim,
to the fullest extent permitted by law, against the following parties:

1. Mich-CA 2026 League;
2. Authorities related to the venues/grounds as published in the official schedule;
3. Michigan USA Track & Field;
4. Mich-CA 2026 League organizers and committee members;
5. All sponsors of the Mich-CA 2026 League; and
6. All employees, principals, directors, shareholders, agents, members, managers, affiliates, volunteers, officials,
and representatives acting for or on behalf of any of the above entities (collectively, the “Released Parties”).

I understand and acknowledge that participation in the Mich-CA 2026 League involves inherent risks, including the risk
of serious injury or death. I voluntarily assume all such risks, known and unknown, associated with my participation.
Medical Fitness Certification

I attest and verify that I am physically fit and sufficiently trained to participate in the Mich-CA 2026 League. I confirm
that I have consulted with a medical professional regarding my physical condition and that I have no known medical
conditions that would prevent safe participation.

### Media and Likeness Release

As a condition of participation, I grant the Mich-CA 2026 League a limited, royalty-free license to use my name, image,
likeness, voice, video recordings, athletic performance, and biographical information (collectively, “Likeness”) in any
format for promotional, broadcast, or reporting purposes related to the event, the sport, or affiliated organizations.

I also agree to maintain respectful conduct and will refrain from making public criticism or inappropriate comments—
whether in person, through social media, or via any public platform—regarding any incident occurring during a Mich-CA
match, or concerning any player, player support personnel, league official, match official, or team participating in a
Mich-CA event, regardless of when such comments are made.

### Safety Equipment Acknowledgment

I understand the significant risk of serious injury associated with not wearing protective equipment. I agree that I will
always wear an approved helmet while batting against any medium-pace or fast bowler. I accept full responsibility for
compliance with this safety requirement and acknowledge the risks involved in failing to do so.

The Mich-CA 2026 League reserves the right to reject any entry and to modify event details at its discretion without
prior notice.
```

## Submit Content

```
By signing below, I am acknowledging that an inherent risk of exposure to COVID-19 exists in any public place where people are present. By attending Mich-CA 2026 League I am voluntarily assuming all risks related to exposure to COVID-19 and agree not to hold Mich-CA 2026 GB; BOD; Charter Members; or any of their directors, shareholders, agents, members, managers, affiliates, volunteers, officials, and representatives liable for any illness or injury.
```

## Design Instructions

- Use shadCN elements and follow current design and color scheme in the project
