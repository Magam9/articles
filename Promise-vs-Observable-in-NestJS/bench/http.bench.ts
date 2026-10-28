import autocannon from 'autocannon';
import { writeFileSync } from 'node:fs';

import { APP_URL, rssMb, startStack } from './processes.js';

/**
 * Real HTTP through the whole Nest pipeline.
 * Run once without interceptors and once with a global one.
 */

const DURATION = Number(process.env.BENCH_DURATION ?? 15);
const CONNECTIONS = Number(process.env.BENCH_CONNECTIONS ?? 50);
const RUNS = Number(process.env.BENCH_RUNS ?? 3);

const scenarios = [
  { name: 'sync baseline', path: '/sync/ping' },
  { name: 'promise ping', path: '/promise/ping' },
  { name: 'observable ping', path: '/observable/ping' },
  { name: 'promise dashboard', path: '/promise/dashboard/7' },
  { name: 'observable dashboard', path: '/observable/dashboard/7' },
];

function run(url: string, duration: number) {
  return autocannon({ url, connections: CONNECTIONS, duration });
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

const rows: Record<string, string | number>[] = [];

for (const withInterceptor of [false, true]) {
  for (const scenario of scenarios) {
    const runs: { rps: number; p50: number; p99: number; errors: number; rss: number }[] = [];

    for (let i = 0; i < RUNS; i++) {
      // Fresh processes for every run, so one run can't warm up or slow down the next
      const stack = await startStack({ WITH_INTERCEPTOR: String(withInterceptor) });
      await run(`${APP_URL}${scenario.path}`, 3); // warm-up: JIT and keep-alive sockets
      const result = await run(`${APP_URL}${scenario.path}`, DURATION);
      runs.push({
        rps: result.requests.average,
        p50: result.latency.p50,
        p99: result.latency.p99,
        errors: result.errors + result.non2xx,
        rss: rssMb(stack.app),
      });
      await stack.stop();
    }

    const row = {
      scenario: scenario.name,
      interceptor: withInterceptor ? 'yes' : 'no',
      'req/sec': Math.round(median(runs.map((r) => r.rps))),
      'p50 ms': median(runs.map((r) => r.p50)),
      'p99 ms': median(runs.map((r) => r.p99)),
      errors: runs.reduce((sum, r) => sum + r.errors, 0),
      'RSS MB': median(runs.map((r) => r.rss)),
      'req/sec per run': runs.map((r) => Math.round(r.rps)).join(' / '),
    };
    rows.push(row);
    console.log(row);
  }
}

console.log(`\nHTTP benchmark: ${CONNECTIONS} connections, ${DURATION}s per run, median of ${RUNS} runs, node ${process.version}`);
console.table(rows);
writeFileSync(new URL('../../bench/results/http.json', import.meta.url), JSON.stringify(rows, null, 2));
