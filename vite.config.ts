import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// In local dev, serve /api/* from the same files Vercel deploys as functions.
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z-]+)(\?.*)?$/);
        if (!match) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
          const handler = mod[req.method ?? 'GET'];
          if (typeof handler !== 'function') {
            res.statusCode = 405;
            return res.end();
          }
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          });
          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(String(error));
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Server error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Server-side settings (Stripe, service role) come from .env.local in dev.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  // Which version a crash report came from: the commit Vercel is building.
  const release = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? 'local';
  return {
    plugins: [
      react(),
      localApi(),
      // With a Sentry token (set in Vercel only), crash reports show our real code instead of the minified
      // build. The maps go to Sentry and are removed from the site.
      process.env.SENTRY_AUTH_TOKEN
        ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          release: { name: release },
          sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
          telemetry: false,
        })
        : null,
    ],
    define: { __RELEASE__: JSON.stringify(release) },
    // Split-off files get plain names, so file names don't describe what's inside.
    build: { sourcemap: process.env.SENTRY_AUTH_TOKEN ? 'hidden' : false, rollupOptions: { output: { chunkFileNames: 'assets/c-[hash].js' } } },
  };
});
