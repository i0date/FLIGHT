// Only the parts of Sentry the crash reporter uses, so the rest (session replay, tracing) isn't downloaded.
export { captureException, init } from '@sentry/browser';
