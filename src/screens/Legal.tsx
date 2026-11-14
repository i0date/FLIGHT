import { CONTACT_EMAIL, LEGAL_UPDATED, OPERATOR, PLACE } from '../lib/legal';
import type { Screen } from '../types';

function Contact() {
  return CONTACT_EMAIL ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> : <span>our support email (being set up — it will appear here soon)</span>;
}

function Page({ title, go, other, children }: { title: string; go: (s: Screen) => void; other: Screen; children: React.ReactNode }) {
  return (
    <div className="screen legal">
      <header className="page-head compact">
        <p className="mono small muted">FLIGHT · {OPERATOR.toUpperCase()}</p>
        <h1>{title}</h1>
        <p className="small muted">Last updated {LEGAL_UPDATED}</p>
      </header>
      <article className="legal-body">{children}</article>
      <button className="btn btn-ghost" onClick={() => go(other)}>{other.name === 'terms' ? 'Read the terms of use' : 'Read the privacy policy'}</button>
      <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>Back to the terminal</button>
    </div>
  );
}

export function Privacy({ go }: { go: (s: Screen) => void }) {
  return (
    <Page title="Privacy policy" go={go} other={{ name: 'terms' }}>
      <p>FLIGHT is a Bible quiz game run by {OPERATOR}, based in {PLACE}. This page explains, in plain words, what we keep about you, why, and how to have it removed.</p>

      <h2>The short version</h2>
      <ul>
        <li>No ads, no tracking, no selling your data. Ever.</li>
        <li>You can play without an account. Then your progress stays on your device.</li>
        <li>With an account we keep your email, your game progress and the details you choose to add.</li>
        <li>Stripe handles payments. We never see your card number.</li>
        <li>You can delete your account, and everything in it, from your Passport at any time.</li>
      </ul>

      <h2>What we keep</h2>
      <h3>Without an account</h3>
      <p>Your streak, scores, miles and settings (such as sound) are saved in your browser’s storage on your device. They are not sent to us.</p>
      <h3>When something goes wrong</h3>
      <p>If the app crashes, it sends us a crash report: what went wrong, on which screen, and your browser and device type. Crash reports never include your name, email, scores or anything you typed.</p>
      <h3>With an account</h3>
      <ul>
        <li><strong>Your email address</strong>, to sign you in.</li>
        <li><strong>Your passenger name</strong> and, if you add them, <strong>your home church</strong> and <strong>a passport photo</strong>.</li>
        <li><strong>Your game progress</strong>: Daily Flight scores, streaks, Book Club and Night Flight results, and the passenger number we give you.</li>
        <li><strong>Your choices</strong>: whether you appear on the public leaderboard, and the crews you run or join.</li>
        <li><strong>Your Frequent Flyer membership</strong>: plan, status and renewal date, and the plan you joined with an invite code.</li>
      </ul>
      <h3>Connecting Flights</h3>
      <p>When you board a Connecting Flight we keep the name you type, your answers count, your score and time, and a random code that identifies your device in that flight. You do not need an account. Flights are deleted after a day.</p>
      <h3>Reminders</h3>
      <p>If you turn on streak reminders, we keep your time zone (so they arrive at the right hour) and what we last sent you. For phone notifications we keep an address your phone’s browser gives us for sending to that device; turning notifications off, or removing the app, deletes it. Email reminders go to your account’s email only if you tick the box, and every one has an unsubscribe link.</p>
      <h3>Question reports</h3>
      <p>If you use “Something wrong with this question?”, we keep the question, the reason and any note you write, the time, a random code for your device and, if you are signed in, your account. We use reports only to fix questions. They are never shown to other players.</p>
      <h3>Payments</h3>
      <p>Frequent Flyer payments are handled by Stripe. Stripe collects your card details and billing information and handles sales tax; we never see or store your card number. We receive a customer reference, your plan and whether it is active. Stripe’s own privacy policy is at <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer">stripe.com/privacy</a>.</p>

      <h2>Who can see what</h2>
      <ul>
        <li><strong>Public leaderboard</strong>: your passenger name, streak and today’s score, unless you turn it off in your Passport.</li>
        <li><strong>Crews</strong>: members of a crew see each other’s name, streak and today’s score.</li>
        <li><strong>Connecting Flights</strong>: everyone in the flight sees the names and scores on its board.</li>
        <li><strong>Your passport photo, email, home church and question reports</strong> are never shown to other players.</li>
      </ul>

      <h2>Why we use it</h2>
      <p>Only to run the game: to sign you in, keep your progress across devices, show leaderboards, provide Frequent Flyer memberships, and answer you when you contact us. We do not use your data for advertising or sell it to anyone.</p>

      <h2>Services we rely on</h2>
      <ul>
        <li><strong>Supabase</strong> stores accounts, progress and photos, and sends reminders.</li>
        <li><strong>Resend</strong> delivers our emails (sign-in codes and reminders).</li>
        <li><strong>Apple, Google and Mozilla</strong> deliver phone notifications to your device, if you turn them on.</li>
        <li><strong>Vercel</strong> hosts the app.</li>
        <li><strong>Sentry</strong> receives crash reports, so we can fix problems.</li>
        <li><strong>Stripe</strong> handles payments and billing.</li>
        <li><strong>Google Fonts</strong> supplies the typefaces, so your browser asks Google for the font files.</li>
      </ul>
      <p>These companies may store or process data outside Canada, including in the United States, where it is subject to local law. We only share what each one needs to do its job.</p>

      <h2>How long we keep it</h2>
      <p>Account data is kept until you delete your account. Connecting Flights are deleted after a day. Crash reports are deleted within 90 days. Stripe keeps payment records for as long as the law requires.</p>

      <h2>Your rights</h2>
      <p>You can see and correct your details in the Passport Office, and delete your account at any time from your Passport. You can also ask us for a copy of what we hold or for anything to be corrected or removed by contacting <Contact />. If you are unhappy with how we handled your information, you can complain to the Office of the Privacy Commissioner of Canada at <a href="https://www.priv.gc.ca" target="_blank" rel="noreferrer">priv.gc.ca</a>.</p>

      <h2>Children</h2>
      <p>FLIGHT is made to be safe for families. If you are under 13, please ask a parent or guardian before creating an account. Parents who think their child has an account without permission can contact us to have it removed.</p>

      <h2>Changes</h2>
      <p>If we change this policy we will update the date at the top, and tell you in the app if the change is significant.</p>

      <h2>Contact</h2>
      <p>{OPERATOR}, {PLACE}. Email: <Contact />.</p>
    </Page>
  );
}

export function Terms({ go }: { go: (s: Screen) => void }) {
  return (
    <Page title="Terms of use" go={go} other={{ name: 'privacy' }}>
      <p>These terms are the agreement between you and {OPERATOR}, based in {PLACE}, for using FLIGHT. By playing, you agree to them. Please also read our privacy policy.</p>

      <h2>Your account</h2>
      <p>You can play without an account. If you make one, use an email address you control and keep access to it private: anyone who can open your email can sign in as you. One account is for one person.</p>

      <h2>Frequent Flyers</h2>
      <ul>
        <li>Frequent Flyer membership is a paid subscription. The price and what it includes are shown before you pay.</li>
        <li>It <strong>renews automatically</strong> each month or year, at the price shown, until you cancel.</li>
        <li>You can cancel at any time from the billing page in the app. You keep your membership until the end of the period you have paid for, and you will not be charged again.</li>
        <li>We do not refund part-used periods, except where the law requires it or where Stripe issues a refund under its own policies.</li>
        <li>Family and church plans are paid by the person who set them up. Members who join with an invite code keep their membership while that plan is active.</li>
        <li>If we change the price, we will tell you before your next renewal, and you can cancel before it takes effect.</li>
      </ul>
      <p>Payments are handled by Stripe, and Stripe’s terms also apply to the payment.</p>

      <h2>Miles, stamps and streaks</h2>
      <p>Miles, status, stamps, visas and streaks are part of the game. They have no cash value and cannot be bought, sold or transferred.</p>

      <h2>Playing fairly</h2>
      <p>Please do not cheat, interfere with the game or other players, or use names that are offensive or pretend to be someone else. We may change a name, remove someone from a leaderboard, crew or flight, or suspend an account that breaks these rules.</p>

      <h2>The questions</h2>
      <p>Questions and explanations are written by FLIGHT. Scripture is quoted from the King James Version. We work hard to make every question accurate, but mistakes can happen; if you spot one, please tell us. FLIGHT is a game to help you learn and enjoy the Bible, not a replacement for reading it, study or your church.</p>
      <p>The app, its questions, design and artwork belong to {OPERATOR}. You may share your results and boarding passes, but please do not copy the questions or the app.</p>

      <h2>Availability</h2>
      <p>We aim to keep FLIGHT running smoothly, but it is provided as it is, and we cannot promise it will always be available or free of errors. We may change or retire features over time.</p>

      <h2>Our responsibility</h2>
      <p>As far as the law allows, we are not responsible for indirect losses, and our total responsibility to you is limited to what you paid us in the 12 months before the problem. Nothing in these terms takes away rights you have under consumer protection law, including Ontario’s Consumer Protection Act.</p>

      <h2>Ending</h2>
      <p>You can stop using FLIGHT and delete your account at any time from your Passport. Deleting your account cancels any Frequent Flyer plan you pay for. We may end or suspend accounts that seriously or repeatedly break these terms.</p>

      <h2>The law</h2>
      <p>These terms are governed by the laws of Ontario and of Canada that apply there, and disputes are handled by the courts of Ontario, unless consumer law gives you the right to use the courts where you live.</p>

      <h2>Changes</h2>
      <p>If we change these terms we will update the date at the top, and tell you in the app before significant changes take effect.</p>

      <h2>Contact</h2>
      <p>{OPERATOR}, {PLACE}. Email: <Contact />.</p>
    </Page>
  );
}
