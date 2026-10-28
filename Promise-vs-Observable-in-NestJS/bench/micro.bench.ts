import { writeFileSync } from 'node:fs';
import { forkJoin, from, lastValueFrom, map, of } from 'rxjs';
import { Bench } from 'tinybench';

/**
 * Pure overhead: no network, no Nest. Just "how much does the abstraction cost".
 * Each task does the same logical work in both styles.
 */

const bench = new Bench({ name: 'Promise vs Observable, no I/O', time: 2_000, warmupTime: 500 });

const double = (x: number) => x * 2;

bench
  .add('promise: await one value', async () => {
    await Promise.resolve(1);
  })
  .add('observable: lastValueFrom(of(1))', async () => {
    await lastValueFrom(of(1));
  })
  .add('promise: 5 transformations', async () => {
    let value = await Promise.resolve(1);
    value = double(value);
    value = double(value);
    value = double(value);
    value = double(value);
    value = double(value);
    return value;
  })
  .add('observable: 5 x map()', async () => {
    return lastValueFrom(of(1).pipe(map(double), map(double), map(double), map(double), map(double)));
  })
  .add('promise: Promise.all of 3', async () => {
    await Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]);
  })
  .add('observable: forkJoin of 3', async () => {
    await lastValueFrom(forkJoin([of(1), of(2), of(3)]));
  })
  .add('observable: forkJoin of 3 promises (from())', async () => {
    await lastValueFrom(forkJoin([from(Promise.resolve(1)), from(Promise.resolve(2)), from(Promise.resolve(3))]));
  });

await bench.run();

const rows = bench.tasks.map((task) => {
  const result = task.result;
  if (!result || !('latency' in result)) return { task: task.name, error: 'no result' };
  return {
    task: task.name,
    'ops/sec': Math.round(result.throughput.mean),
    'mean (ns)': Math.round(result.latency.mean * 1e6),
    'p99 (ns)': Math.round(result.latency.p99 * 1e6),
    'rme %': Number(result.latency.rme.toFixed(2)),
  };
});

console.log(`\n${bench.name} (node ${process.version})`);
console.table(rows);
writeFileSync(new URL('../../bench/results/micro.json', import.meta.url), JSON.stringify(rows, null, 2));
