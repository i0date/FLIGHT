import { PLAN_INFO, formatPrice, localCurrency } from '../lib/billing';
import { CF_SECONDS, CF_SIZE } from '../lib/connecting';
import { CONTACT_EMAIL } from '../lib/legal';
import type { Screen } from '../types';

// For pastors and youth leaders: what a church plan gives, and how to run a Connecting Flight on a Sunday.
// It has its own address (/churches) so it can be shared. Prices and seats come from the plans themselves.

// Most people in a room who can board one Connecting Flight (see cf_join in the connecting flights migration).
const FLIGHT_SEATS = 50;
// Most travellers in one crew (see join_crew in the leaderboards migration).
const CREW_SEATS = 100;

export function Churches({ go }: { go: (s: Screen) => void }) {
  const currency = localCurrency();
  const church = PLAN_INFO.find((p) => p.id === 'church')!;
  const group = PLAN_INFO.find((p) => p.id === 'group')!;
  const price = (p: typeof church) => `${formatPrice(p.prices[currency].yearly, currency)} a year or ${formatPrice(p.prices[currency].monthly, currency)} a month`;

  return (
    <div className="screen legal">
      <header className="page-head compact">
        <p className="mono small muted">FLIGHT · FOR CHURCHES</p>
        <h1>Bring your church on board</h1>
        <p className="small muted">For pastors, youth leaders and small group hosts.</p>
      </header>
      <article className="legal-body">
        <p>FLIGHT is a daily Bible quiz: ten questions a day, a streak to keep, and a gentle push to open the Bible again tomorrow. Everyone can play for free. A church plan gives your whole congregation the rest, on one invite code.</p>

        <h2>What your people get</h2>
        <ul>
          <li><strong>Frequent Flyers for everyone</strong> on the plan: the weekly Night Flight, streak shields for missed days, passport stamps for each book they finish, and the archive of past Daily Flights.</li>
          <li><strong>A private board for your church.</strong> Start a crew and share its code; up to {CREW_SEATS} people see each other’s streaks and today’s scores.</li>
          <li><strong>Connecting Flights</strong>: a live quiz the whole room plays at once, on their own phones.</li>
          <li>No ads, no tracking, and nothing shown to anyone outside your church but the names people choose.</li>
        </ul>

        <h2>One code for {church.seats} people</h2>
        <p>The Large church plan is {price(church)} ({currency}). It covers up to {church.seats} people, you included.</p>
        <ol>
          <li>Make an account on the Passport tab, then choose Large church in the Lounge.</li>
          <li>After paying, the Lounge shows your invite code and how many seats are taken.</li>
          <li>Share the code in the bulletin, the group chat or on the screen. Each person signs in and types it under “Have an invite code?” in the Lounge.</li>
        </ol>
        <p>People can leave the plan whenever they like, which frees their seat for someone else. You can switch plans or cancel from the Lounge at any time.</p>
        <p>A smaller group? The Church &amp; groups plan covers up to {group.seats} people for {price(group)}.{CONTACT_EMAIL && <> More than {church.seats}? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we’ll set up a plan that fits.</>}</p>

        <h2>A Connecting Flight on a Sunday</h2>
        <p>Everyone answers the same {CF_SIZE} questions against a {CF_SECONDS}-second clock, and the board shows who lands first. It takes about five minutes, start to finish.</p>
        <ol>
          <li><strong>Before the service</strong>, open the Lounge and tap Host a Connecting Flight. You get a four-letter flight code.</li>
          <li><strong>Put the code on the screen</strong>, or tap Invite your group to send the link. People open theflightgame.com, type the code and their name, and they’re on board. They don’t need an account or a plan to play.</li>
          <li><strong>Watch the names arrive</strong>, then tap Take off. After a short countdown everyone flies at once.</li>
          <li><strong>Read out the board.</strong> Best score wins; on a tie, the fastest lands first. A good moment to talk about one of the questions.</li>
        </ol>
        <p>Up to {FLIGHT_SEATS} people can board one flight. For a bigger room, open a second flight, or play in teams with one phone each. Flights are cleared away after a day.</p>

        <h2>Ideas that work well</h2>
        <ul>
          <li>A Connecting Flight to open youth group, or to close a sermon series.</li>
          <li>A church crew, with a shout-out on Sunday for the longest streaks.</li>
          <li>Reading one book together in Book Club, a little each day.</li>
        </ul>
      </article>
      <button className="btn btn-primary" onClick={() => go({ name: 'premium' })}>See the plans</button>
      <button className="btn btn-ghost" onClick={() => go({ name: 'home' })}>Back to the terminal</button>
    </div>
  );
}
