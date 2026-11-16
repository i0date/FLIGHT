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
- **Supabase sign-in settings** (Dashboard → Authentication), a five-minute check:
  - *Rate Limits*: emails sent per hour (the sign-in codes) is low enough to stop someone spamming addresses, e.g. 30.
  - *Sign In / Providers → Email*: "Confirm email" on; nothing else switched on that FLIGHT doesn't use.
  - *Attack Protection*: turn on CAPTCHA (hCaptcha or Turnstile) if sign-in codes are ever abused.
  - *Emails*: the sign-in code email reads as FLIGHT and is sent from theflightgame.com (custom SMTP via Resend).
- **After the security headers**: sign in on your phone and add or change a passport photo once, to confirm both still work.
- **Legal review** of the privacy policy and terms.

## Next to build

- Daily Flight questions toward nine months without a repeat (about 2,000 more).
- Book Club: a quality pass and a check for questions the Daily Flight also asks.
- Later: questions served by the server, so answers can't be looked up in the app.
- Later: the review flight and night-mode choice are kept per device; they could follow the account.

## Done (November 2026)

- Link previews, a first-time welcome, the KJV verse behind every answer, the review flight,
  accessibility fixes, night mode, and automated tests that run before every deploy.
