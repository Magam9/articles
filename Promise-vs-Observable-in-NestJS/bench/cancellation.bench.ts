import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

import { APP_URL, DOWNSTREAM_URL, startStack } from './processes.js';

/**
 * The client asks for a slow report (2 s downstream) and gives up after 200 ms.
 * Question: does the downstream call keep running after nobody is waiting for it?
 */

const REQUESTS = 50;
const GIVE_UP_AFTER_MS = 200;

const variants = [
  { name: 'promise', path: (i: number) => `/promise/reports/${i}` },
  { name: 'promise-abortable', path: (i: number) => `/promise/reports/${i}/abortable` },
  { name: 'observable', path: (i: number) => `/observable/reports/${i}` },
];

const stack = await startStack();
await fetch(`${DOWNSTREAM_URL}/stats`, { method: 'POST' });

for (const variant of variants) {
  await Promise.all(
    Array.from({ length: REQUESTS }, (_, i) =>
      fetch(`${APP_URL}${variant.path(i)}`, { signal: AbortSignal.timeout(GIVE_UP_AFTER_MS) }).catch(() => undefined)
    )
  );
}

// Let every downstream call either finish (2 s) or be abandoned
await sleep(2_500);
const stats = (await (await fetch(`${DOWNSTREAM_URL}/stats`)).json()) as Record<string, unknown>;
await stack.stop();

console.log(`\n${REQUESTS} requests per variant, client gives up after ${GIVE_UP_AFTER_MS} ms`);
console.table(stats);
writeFileSync(new URL('../../bench/results/cancellation.json', import.meta.url), JSON.stringify(stats, null, 2));
