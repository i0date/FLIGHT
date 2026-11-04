# Flight

A Bible quiz game with an aeroplane theme. React + TypeScript + Vite, mobile-first.

```bash
npm install
npm run dev
```

## What's in it

| Feature | Where |
| --- | --- |
| **Daily Flight**: 10 questions a day on passages, books and themes. Everyone gets the same 10 for the date. | `src/screens/Daily.tsx`, bank in `src/data/dailyQuestions.ts` |
| **Streaks**: playing on consecutive days builds the streak; missing a day resets it. | `src/lib/profile.tsx` (`recordDaily`, `liveStreak`) |
| **Book Club**: join the book you're studying and take 5 harder questions that climb from Take-off (10,000 ft) to Ceiling (41,000 ft). Each book you finish stamps your passport; complete all 66. | `src/screens/BookClub.tsx`, questions in `src/data/bookClubQuestions.ts` |
| **First Class (premium)**: crew leaderboards (private boards with a share code) and a weekly streak shield. | `src/screens/Premium.tsx`, `src/screens/Leaderboard.tsx` |
| **Game gates**: the list of games on the home screen. | `src/games/registry.ts` |

## Adding content

**Daily questions:** add an entry to `dailyQuestions.ts`. Put the correct answer in `a` and three wrong ones in `wrong`. Options are shuffled for you. Always include `ref`.

**A Book Club book:** add a 5-question array under the book's id (see `src/data/books.ts`) in `bookClubQuestions.ts`, ordered easiest to hardest. The book unlocks automatically. 12 of 66 books are written so far: Genesis, Exodus, Ruth, Esther, Daniel, Jonah, Mark, John, Acts, Romans, Philippians and James.

**A new game (e.g. the crossword):**
1. Build `src/screens/Crossword.tsx`.
2. Add `{ name: 'crossword' }` to the `Screen` type in `src/types.ts`.
3. Render it in `src/App.tsx`.
4. In `src/games/registry.ts`, set the crossword gate to `status: 'live'` with `screen: { name: 'crossword' }`.

## Not wired up yet

- **Accounts and a server.** Progress is saved in the browser (`localStorage`). Real leaderboards, joinable crews and Book Club member counts need a backend such as Supabase or Firebase. Other names on the leaderboard are sample data.
- **Payments.** "Upgrade" is a demo toggle. Use Stripe on the web, or App Store / Play Store in-app purchases if this ships as a phone app (e.g. via Capacitor).
