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
| **Book Club**: join the book you're studying and take 5 questions at levels 3, 4, 5, 6, 6. Stamping the passport is a Flight Club perk; free players' completed books are stamped when they join. | `src/screens/BookClub.tsx`, questions in `src/data/bookClubQuestions.ts` |
| **Flight Club (paid)**: passport stamps, private leaderboards and a weekly streak shield. Plans: individual, family and church/group. | `src/screens/Premium.tsx`, `src/screens/Leaderboard.tsx` |
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

**A Book Club book:** add a 5-question array under the book's id (see `src/data/books.ts`) in `bookClubQuestions.ts`, at levels 3, 4, 5, 6, 6. The book unlocks automatically. 12 of 66 books are written so far: Genesis, Exodus, Ruth, Esther, Daniel, Jonah, Mark, John, Acts, Romans, Philippians and James.

**A new game (e.g. the crossword):**
1. Build `src/screens/Crossword.tsx`.
2. Add `{ name: 'crossword' }` to the `Screen` type in `src/types.ts`.
3. Render it in `src/App.tsx`.
4. In `src/games/registry.ts`, set the crossword gate to `status: 'live'` with `screen: { name: 'crossword' }`.

## Not wired up yet

- **Accounts and a server.** Progress is saved in the browser (`localStorage`). Real leaderboards, joinable crews and Book Club member counts need a backend such as Supabase or Firebase. Other names on the leaderboard are sample data.
- **Payments.** "Upgrade" is a demo toggle. Use Stripe on the web, or App Store / Play Store in-app purchases if this ships as a phone app (e.g. via Capacitor).
