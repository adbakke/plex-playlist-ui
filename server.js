import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const PLEX_URL = (process.env.PLEX_URL || 'http://localhost:32400').replace(/\/$/, '');
const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PORT = parseInt(process.env.PORT || '3002', 10);

const app = new Hono();

// CORS for module federation (host app on different port)
app.use('/*', cors({ origin: '*' }));

// Proxy /api/* → Plex, stripping the /api prefix
app.all('/api/*', async (c) => {
  const plexPath = c.req.path.replace(/^\/api/, '');
  const url = `${PLEX_URL}${plexPath}`;
  const headers = new Headers();
  headers.set('X-Plex-Token', PLEX_TOKEN);
  headers.set('Accept', 'application/json');

  try {
    const resp = await fetch(url, {
      method: c.req.method,
      headers,
      body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : c.req.raw.body,
    });
    const body = await resp.arrayBuffer();
    return new Response(body, {
      status: resp.status,
      headers: { 'content-type': resp.headers.get('content-type') || 'application/json' },
    });
  } catch (err) {
    return c.json({ error: 'Plex unreachable', detail: err.message }, 502);
  }
});

// Serve built frontend
app.use('/*', serveStatic({ root: './dist' }));
// SPA fallback
app.get('/*', serveStatic({ root: './dist', path: 'index.html' }));

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`plex-playlist-ui running on http://localhost:${PORT}`);
  console.log(`Proxying /api/* → ${PLEX_URL}`);
});
