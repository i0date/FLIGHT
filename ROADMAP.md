# FLIGHT roadmap

## Waiting on Adeoti

- **Readable crash reports.** In Vercel → Project → Settings → Environment Variables, add (for Production):
  - `SENTRY_AUTH_TOKEN`: made in Sentry under Settings → Auth Tokens. It is a secret: add it in Vercel only, never in chat or the repo.
  - `SENTRY_ORG`: the organization's slug in Sentry.
  - `SENTRY_PROJECT`: the project's slug (`flight` if renamed, otherwise `javascript`).

  Then redeploy. The build already uploads source maps when these are set.
- **The corporation**, then live payments: run `npm run setup:payments -- --live` with the live secret key (`sk_live_…`).
- **The App Store** (after the corporation): Capacitor wrapper, Apple Developer account, in-app purchases.
- **A mailing address** for the footer of reminder emails.
- **Test account deletion** with a real account.
- **Legal review** of the privacy policy and terms.

## Next to build

- Daily Flight questions toward nine months without a repeat (about 2,000 more).
- Automated tests for streaks, shields, the daily rotation and miles.
- Book Club: a quality pass and a check for questions the Daily Flight also asks.
- Later: questions served by the server, so answers can't be looked up in the app.
