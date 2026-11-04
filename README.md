# Flight

A Bible quiz game with an aeroplane theme. React + TypeScript + Vite, mobile-first.

```bash
npm install
npm run dev
```

## What's in it

| Feature | Where |
| --- | --- |
| **Daily Flight**: 10 questions a day that climb from level 1 to level 6. Everyone gets the same 10 for the date. | `src/screens/Daily.tsx`, bank in `src/data/dailyQuestions.ts` (levels 1–2) and `src/data/dailyHarder.ts` (levels 3–6) |
| **Streaks**: playing on consecutive days builds the streak; missing a day resets it. | `src/lib/profile.tsx` (`recordDaily`, `liveStreak`) |
| **Book Club**: join the book you're studying. Each book has 21 questions flown as 3 legs of 7 (Departure, Cruise, Final approach), each harder than the last. Score 15 of 21 to earn the book's stamp; legs can be re-flown and the best score counts. Putting stamps in the passport is a Flight Club perk. | `src/screens/BookClub.tsx`, questions in `src/data/bookclub/` |
| **Flight Club (paid)**: passport stamps, starting crews, a weekly streak shield, **Night Flight** (10 level-6 questions, new every Monday, one try a week) and the **flight archive** (replay the last 30 Daily Flights without affecting streaks or miles). Plans: individual, family and church/group. | `src/screens/Premium.tsx`, `src/screens/Leaderboard.tsx` |
| **Game gates**: the list of games on the home screen. | `src/games/registry.ts` |

## Difficulty levels

| Level | Name | Tests |
| --- | --- | --- |
| 1 | Take-off | Recall |
| 2 | Climb | Context |
| 3 | Cruise | Connections: who said it, the New Testament quoting the Old, parallel accounts |
| 4 | High altitude | Sequence and precise detail |
| 5 | Ceiling | Synthesis: "which is NOT", themes across books |
| 6 | Stratosphere | Scholar-level detail and near-miss traps |

Questions are either multiple choice (`a` + `wrong`) or put-in-order (`kind: 'order'` with `order` written in the correct sequence).

## Adding content

**Daily questions:** add an entry with a `level`. Each day needs at least 2 questions at every level from 3 to 6, so keep every level well stocked. Put the correct answer in `a` and three wrong ones in `wrong`. Options are shuffled for you. Always include `ref`.

**A Book Club book:** write 21 questions in `src/data/bookclub/` (questions 1–7 are leg 1, 8–14 leg 2, 15–21 leg 3, with levels never going down), then add the book to `bookClubQuestions.ts`. It unlocks automatically. 18 of 66 books are written so far: Genesis, Exodus, Ruth, Esther, Psalms, Proverbs, Isaiah, Daniel, Jonah, Matthew, Mark, Luke, John, Acts, Romans, 1 Corinthians, Philippians and James.

**A new game (e.g. the crossword):**
1. Build `src/screens/Crossword.tsx`.
2. Add `{ name: 'crossword' }` to the `Screen` type in `src/types.ts`.
3. Render it in `src/App.tsx`.
4. In `src/games/registry.ts`, set the crossword gate to `status: 'live'` with `screen: { name: 'crossword' }`.

## Accounts (Supabase)

Sign-in is by email code (no passwords). Each account gets a passport with a passenger number, and progress (streak, daily results, Book Club routes) is saved to it. Progress made before signing in is merged in.

- Schema and security rules: `supabase/migrations/`. Every table uses row-level security, so travellers can only read and write their own rows. Memberships can only be written by the server.
- Sign-in email: `supabase/templates/magic_link.html`.
- Settings: copy `.env.example` to `.env.local` and fill in the project URL and anon key. Without them the app runs in device-only mode.

**Frequent Flyer miles** come from what you've flown (`src/lib/miles.ts`): 250 per daily flight plus 100 per correct answer, 300 per Book Club leg plus 150 per correct answer, 1,500 per stamp earned, and 50 per day of your best streak. Status: Blue, Silver (5,000), Gold (20,000), Platinum (50,000).

## Leaderboards

A public board ranks travellers by today's Daily Flight score (ties go to whoever landed first) or by current streak. It shows only the passenger name, streak and today's score, and anyone can switch themselves off it on the Passport page. **Crews** are private boards for a church, family or friends: anyone signed in can join with a 6-letter code; starting one (up to 5, with up to 100 members each) is a Flight Club perk. All of this goes through database functions in `supabase/migrations/20261104030000_leaderboards.sql`; the tables themselves stay locked.

## Payments (Stripe)

Flight Club plans: Individual, Family (6 seats) and Church & groups (30 seats), monthly or yearly, priced in USD with a CAD option. The server code is in `api/`: checkout, the Stripe webhook (the only thing that writes memberships), the billing page, and joining or leaving a plan by invite code.

To switch payments on, create a Stripe account and run `npm run setup:payments`. Until then the plans are shown and checkout says "opening soon".

## Not wired up yet

- **Google and Apple sign-in.** These need a Google Cloud and an Apple Developer setup.
- **Stripe keys.** Payments are built but switched off until `npm run setup:payments` is run. A phone-app version would need App Store / Play Store in-app purchases.
