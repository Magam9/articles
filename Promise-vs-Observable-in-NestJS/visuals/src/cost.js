import { C, svg, el, hbar, text, title, footnote } from './lib.js';

export const meta = { width: 680, height: 300 };

// Throughput lost, computed from bench/results/http.json (median req/sec)
const rows = [
  { label: 'Add one global interceptor', sub: 'async/await, empty endpoint', value: 16.8, color: C.ink2 },
  { label: 'Return an Observable', sub: 'empty endpoint', value: 12.6, color: C.observable },
  { label: 'Return an Observable', sub: 'dashboard with real I/O', value: 4.3, color: C.observable },
];

export function render() {
  const s = svg(meta.width, meta.height);
  title(s, 24, 36, 'One interceptor costs more than switching to RxJS', 'Throughput lost compared with the same endpoint without that change, in %.');

  const x0 = 236;
  const x1 = 600;
  const max = 20;
  const sx = (v) => x0 + (v / max) * (x1 - x0);
  const top = 86;
  const band = 54;
  const barH = 22;

  for (const tick of [0, 5, 10, 15, 20]) {
    el(s, 'line', { x1: sx(tick), x2: sx(tick), y1: top - 4, y2: top + band * rows.length - 10, stroke: tick === 0 ? C.axis : C.grid, 'stroke-width': 1 });
    text(s, sx(tick), top + band * rows.length + 8, `${tick}%`, { size: 11.5, fill: C.muted, anchor: 'middle', tabular: true });
  }

  rows.forEach((row, i) => {
    const y = top + i * band + 4;
    text(s, 24, y + 8, row.label, { size: 13.5, baseline: 'middle' });
    text(s, 24, y + 25, row.sub, { size: 12, fill: C.muted, baseline: 'middle' });
    hbar(s, x0, y, sx(row.value) - x0, barH, row.color);
    text(s, sx(row.value) + 8, y + barH / 2 + 1, `−${row.value.toFixed(1)}%`, { size: 12.5, weight: 600, baseline: 'middle', tabular: true });
  });

  footnote(s, 24, meta.height - 12, 'Median of 3 runs · autocannon, 50 connections · bench/http.bench.ts');
}
