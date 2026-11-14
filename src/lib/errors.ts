// Crash reports to Sentry, so we hear about problems on travellers' phones. Only in the built app, and only
// once a project key is set below. The reporter loads after the app has opened, so it never slows the start.
// Reports carry what broke and on which screen, never names, emails, scores or codes from links.

// Sentry's project key (the "DSN"). It is meant to be public: it can only send reports, not read them.
const DSN = 'https://33e018415c6b28eb0c1954039a81c57b@o4512430665891840.ingest.us.sentry.io/4512430681292800';

declare const __RELEASE__: string;

type Sentry = typeof import('./sentry');
let sentry: Promise<Sentry> | null = null;

// Links can carry an unsubscribe token or a Connecting Flights code, so only the page itself is kept.
const bare = (url: string | undefined) => {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.origin);
    return u.origin + u.pathname;
  } catch {
    return undefined;
  }
};

function load(): Promise<Sentry> | null {
  if (!DSN || !import.meta.env.PROD) return null;
  sentry ??= import('./sentry').then((S) => {
    S.init({
      dsn: DSN,
      release: __RELEASE__,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend(event) {
        if (event.request) {
          event.request.url = bare(event.request.url);
          delete event.request.query_string;
          delete event.request.cookies;
        }
        delete event.user;
        return event;
      },
      beforeBreadcrumb(crumb) {
        // Console lines can quote anything, so they stay out of reports.
        if (crumb.category === 'console') return null;
        if (crumb.data?.url) crumb.data.url = bare(crumb.data.url);
        if (crumb.data?.from) crumb.data.from = bare(crumb.data.from);
        if (crumb.data?.to) crumb.data.to = bare(crumb.data.to);
        return crumb;
      },
    });
    return S;
  });
  return sentry;
}

// Start listening for crashes once the page has loaded.
export function startErrorReports() {
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', () => load(), { once: true });
}

// Report something caught by the app itself (a screen that crashed, say), with the screen it happened on.
export function reportError(error: unknown, screen?: string) {
  load()?.then((S) => S.captureException(error, screen ? { tags: { screen } } : undefined));
}
