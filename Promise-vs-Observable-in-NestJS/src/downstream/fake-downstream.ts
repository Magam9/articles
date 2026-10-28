import { createServer, IncomingMessage, ServerResponse } from 'node:http';

/**
 * A tiny "other team's API" that the NestJS app talks to.
 * Latency is fixed so both implementations get exactly the same conditions.
 *
 *   GET /users/:id               20 ms
 *   GET /orders?userId=          40 ms
 *   GET /recommendations?userId= 60 ms, every 5th call answers 503
 *   GET /reports/:id?variant=    2 s, counts finished vs. abandoned requests
 *   GET /stats                   counters for the cancellation benchmark
 *   POST /stats/reset
 */

const PORT = Number(process.env.DOWNSTREAM_PORT ?? 4000);

type ReportStats = { started: number; finished: number; abandoned: number };
const reportStats = new Map<string, ReportStats>();
let recommendationCalls = 0;

function statsFor(variant: string): ReportStats {
  let stats = reportStats.get(variant);
  if (!stats) {
    stats = { started: 0, finished: 0, abandoned: 0 };
    reportStats.set(variant, stats);
  }
  return stats;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function after(ms: number, req: IncomingMessage, res: ServerResponse, send: () => void) {
  const timer = setTimeout(send, ms);
  // If the caller gives up, stop the work. This is what a well-behaved API does.
  res.on('close', () => {
    if (!res.writableEnded) clearTimeout(timer);
  });
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const [, resource, id] = url.pathname.split('/');

  if (resource === 'users' && id) {
    return after(20, req, res, () => sendJson(res, 200, { id: Number(id), name: `User ${id}`, plan: 'pro' }));
  }

  if (resource === 'orders') {
    const userId = Number(url.searchParams.get('userId'));
    return after(40, req, res, () =>
      sendJson(res, 200, [
        { id: userId * 10 + 1, total: 42.5, status: 'shipped' },
        { id: userId * 10 + 2, total: 13.0, status: 'processing' },
      ])
    );
  }

  if (resource === 'recommendations') {
    recommendationCalls += 1;
    const shouldFail = recommendationCalls % 5 === 0;
    return after(60, req, res, () =>
      shouldFail
        ? sendJson(res, 503, { message: 'Recommendations are having a bad day' })
        : sendJson(res, 200, [{ sku: 'coffee-beans-1kg' }, { sku: 'aeropress-filters' }])
    );
  }

  if (resource === 'reports' && id) {
    const stats = statsFor(url.searchParams.get('variant') ?? 'unknown');
    stats.started += 1;
    const timer = setTimeout(() => {
      stats.finished += 1;
      sendJson(res, 200, { id, rows: 10_000 });
    }, 2_000);
    res.on('close', () => {
      if (!res.writableEnded) {
        clearTimeout(timer);
        stats.abandoned += 1;
      }
    });
    return;
  }

  if (resource === 'stats' && req.method === 'POST') {
    reportStats.clear();
    recommendationCalls = 0;
    return sendJson(res, 200, { ok: true });
  }

  if (resource === 'stats') {
    return sendJson(res, 200, Object.fromEntries(reportStats));
  }

  return sendJson(res, 404, { message: 'Not found' });
});

server.keepAliveTimeout = 30_000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Fake downstream listening on http://localhost:${PORT}`);
});
