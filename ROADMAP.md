# FLIGHT roadmap

## 🔴 Urgent and very important (before launch)

All of these are Adeoti's: billing and legal decisions only the account owner can make.

- **Vercel → Pro (US$20/month).** The free Hobby plan doesn't allow commercial use, and FLIGHT takes
  subscriptions. Vercel → Settings → Billing.
- **Supabase → Pro (US$25/month).** The free plan pauses a project after a week without activity and has no
  daily backups to restore from. Losing everyone's streaks would be the worst thing that could happen to FLIGHT.
  Supabase → Organization → Billing.
- **Resend: check the plan.** The free plan sends 100 emails a day. If sign-in codes go out through Resend, a
  busy launch day could stop people signing in. Upgrade if launch could bring more than ~100 sign-ins a day.
- **Legal review** of the privacy policy and terms (theflightgame.com/privacy and /terms) by a lawyer.

## 🟠 Important (in this order)

1. **Sign in with Google and Apple: the keys.** The app side is built: each button appears on its own once
   its provider is switched on in Supabase. Steps are under "Waiting on Adeoti".
2. **Crossword.** Start with a new crossword every two weeks, made by Adeoti. Until it's ready, the "Arriving
   soon" Crossword row on Departures could be hidden.

## Waiting on Adeoti

- **Sign in with Google** (about 15 minutes, free):
  1. Google Cloud Console → APIs & Services → OAuth consent screen: app name FLIGHT, home page
     theflightgame.com, privacy and terms links, publish the app.
  2. Credentials → Create credentials → OAuth client ID → Web application.
     Authorized JavaScript origins: `https://theflightgame.com`.
     Authorized redirect URI: `https://izbtudngvxquegluyums.supabase.co/auth/v1/callback`.
  3. Supabase → Authentication → Sign In / Providers → Google: paste the client ID and secret, switch on.
- **Sign in with Apple** (needs the Apple Developer account, US$99/year):
  1. Certificates, IDs & Profiles → Identifiers: an App ID with "Sign in with Apple", then a Services ID
     (e.g. `com.theflightgame.web`). Configure it: domain `theflightgame.com`, return URL
     `https://izbtudngvxquegluyums.supabase.co/auth/v1/callback`.
  2. Keys → a new key with "Sign in with Apple"; download the .p8 file (it downloads once only).
  3. Supabase → Authentication → Sign In / Providers → Apple: the Services ID as the client ID, and the
     secret made from the .p8 key (Supabase's Apple page explains how). **That secret expires every six
     months**: put a reminder in the calendar to make a new one.
- **Then test** both on a phone, in the browser and from the Home Screen app. Signing in with the same email
  as an existing account should open that same account. Apple may hide the email; that makes a new account.

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

## Next to build (after the important list)

- Daily Flight questions toward nine months without a repeat (about 1,700 more).
- Book Club: a quality pass and a check for questions the Daily Flight also asks.
- Test on real phones, especially an iPhone using FLIGHT from the Home Screen.
- Later: questions served by the server, so answers can't be looked up in the app.
- Later: the review flight and night-mode choice are kept per device; they could follow the account.

## Done (November 2026)

- Link previews, a first-time welcome, the KJV verse behind every answer, the review flight,
  accessibility fixes, night mode, and automated tests that run before every deploy.
- Visual polish: the gate before take-off, Scripture in Source Serif, the landing flight path, amber buttons at night.
- Security: enforced security headers, a cap on guest question reports, and a key on the reminders function.
- A page for church leaders at theflightgame.com/churches: what the church plans give, one invite code for
  100 people, and running a Connecting Flight on a Sunday. Linked from the Terminal footer and the plans.
