import { C, svg, el, hbar, text, legend, title, footnote, fmt } from './lib.js';

export const meta = { width: 680, height: 404 };

// bench/results/micro.json, mean latency in ns
const rows = [
  { label: 'Await one value', promise: 289, observable: 510 },
  { label: 'Five transformations', promise: 289, observable: 1950 },
  { label: 'Fan-out to three', promise: 604, observable: 1624 },
];

export function render() {
  const s = svg(meta.width, meta.height);
  title(s, 24, 36, 'RxJS costs a microsecond or two', 'Mean time per operation without any I/O, in nanoseconds. Lower is better.');
  legend(s, 24, 96, [
    { label: 'async/await', color: C.promise },
    { label: 'RxJS', color: C.observable },
  ]);

  const x0 = 176;
  const x1 = 548;
  const max = 2000;
  const sx = (v) => x0 + (v / max) * (x1 - x0);
  const top = 122;
  const band = 72;
  const barH = 20;

  for (const tick of [0, 500, 1000, 1500, 2000]) {
    el(s, 'line', { x1: sx(tick), x2: sx(tick), y1: top - 6, y2: top + band * rows.length - 8, stroke: tick === 0 ? C.axis : C.grid, 'stroke-width': 1 });
    text(s, sx(tick), top + band * rows.length + 12, tick === 0 ? '0' : `${fmt(tick)} ns`, { size: 11.5, fill: C.muted, anchor: 'middle', tabular: true });
  }

  text(s, 656, top - 10, 'RxJS / await', { size: 11.5, fill: C.muted, anchor: 'end' });

  rows.forEach((row, i) => {
    const y = top + i * band + 6;
    text(s, 24, y + barH + 2, row.label, { size: 13.5, fill: C.ink, baseline: 'middle' });
    hbar(s, x0, y, sx(row.promise) - x0, barH, C.promise);
    hbar(s, x0, y + barH + 2, sx(row.observable) - x0, barH, C.observable);
    text(s, sx(row.promise) + 8, y + barH / 2 + 1, `${fmt(row.promise)}`, { size: 12, fill: C.ink2, baseline: 'middle', tabular: true });
    text(s, sx(row.observable) + 8, y + barH * 1.5 + 3, `${fmt(row.observable)}`, { size: 12, fill: C.ink2, baseline: 'middle', tabular: true });
    const ratio = (row.observable / row.promise).toFixed(1);
    text(s, 656, y + barH + 2, `${ratio}×`, { size: 13, weight: 600, anchor: 'end', baseline: 'middle', fill: C.ink });
  });

  footnote(s, 24, meta.height - 16, 'tinybench · Node.js 22 · RxJS 7.8 · bench/micro.bench.ts');
}
