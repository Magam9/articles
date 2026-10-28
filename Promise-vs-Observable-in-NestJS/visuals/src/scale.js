import { C, svg, el, hbar, text, title, footnote, ease, progress, clamp } from './lib.js';

export const meta = { width: 680, height: 330, duration: 8.5, fps: 20, poster: 8.5 };

const rows = [
  { label: 'async/await, 5 steps', value: 289, color: C.promise },
  { label: 'RxJS, 5 × map()', value: 1950, color: C.observable },
  { label: 'One dashboard request', value: 66_000_000, color: C.muted, note: 'p50 under load' },
];

function unit(ns) {
  if (ns >= 1e6) return `${+(ns / 1e6).toFixed(ns >= 1e7 ? 0 : 1)} ms`;
  if (ns >= 1e3) return `${+(ns / 1e3).toFixed(ns >= 1e4 ? 0 : 1)} µs`;
  return `${Math.round(ns)} ns`;
}

function niceStep(max) {
  const raw = max / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / pow;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * pow;
}

export function render(t) {
  const s = svg(meta.width, meta.height);
  const zoom = ease(progress(t, 1.6, 5.2));
  const lo = Math.log10(2_200);
  const hi = Math.log10(72_000_000);
  const max = Math.pow(10, lo + (hi - lo) * zoom);

  title(
    s,
    24,
    36,
    zoom < 0.5 ? 'Zoomed in, RxJS looks expensive…' : '…zoomed out to a real request, it disappears',
    'Same data, same axis. Only the scale changes.'
  );

  const x0 = 196;
  const x1 = 640;
  const sx = (v) => x0 + (v / max) * (x1 - x0);
  const top = 92;
  const band = 56;
  const barH = 22;
  const bottom = top + band * rows.length;

  const step = niceStep(max);
  for (let v = 0; v <= max * 1.0001; v += step) {
    const x = sx(v);
    el(s, 'line', { x1: x, x2: x, y1: top - 4, y2: bottom - 10, stroke: v === 0 ? C.axis : C.grid, 'stroke-width': 1 });
    text(s, x, bottom + 8, v === 0 ? '0' : unit(v), { size: 11.5, fill: C.muted, anchor: 'middle', tabular: true });
  }

  const grow = ease(progress(t, 0, 0.9));
  rows.forEach((row, i) => {
    const y = top + i * band + 4;
    text(s, 24, y + barH / 2 + 1, row.label, { size: 13.5, baseline: 'middle' });
    if (row.note) text(s, 24, y + barH / 2 + 18, row.note, { size: 11.5, fill: C.muted, baseline: 'middle' });

    const full = sx(row.value) - x0;
    const w = Math.min(full, x1 - x0 + 12) * grow;
    hbar(s, x0, y, Math.max(w, 0), barH, row.color);

    if (full > x1 - x0 + 12) {
      // Off the chart: show where it really ends
      text(s, x1 + 18, y + barH / 2 + 1, '→', { size: 14, fill: C.ink2, baseline: 'middle', anchor: 'middle' });
    } else if (w > 0.5 && grow === 1) {
      text(s, x0 + w + 8, y + barH / 2 + 1, unit(row.value), { size: 12, fill: C.ink2, baseline: 'middle', tabular: true });
    }
  });

  // The punchline: the RxJS bar is still there, just thinner than a pixel
  const callout = clamp(progress(t, 5.4, 6.2));
  if (callout > 0) {
    const g = el(s, 'g', { opacity: callout });
    const y = top + band + 4 + barH / 2;
    g.appendChild(el(s, 'circle', { cx: x0, cy: y, r: 13, fill: 'none', stroke: C.ink, 'stroke-width': 1.5 }));
    g.appendChild(el(s, 'line', { x1: x0 + 13, y1: y, x2: x0 + 60, y2: y, stroke: C.ink, 'stroke-width': 1 }));
    g.appendChild(text(s, x0 + 66, y - 6, 'The RxJS overhead is still here.', { size: 13, weight: 600, baseline: 'middle' }));
    g.appendChild(
      text(s, x0 + 66, y + 12, '≈ 1.7 µs extra, about 0.003% of one request', { size: 12.5, fill: C.ink2, baseline: 'middle' })
    );
  }

  footnote(s, 24, meta.height - 14, 'bench/micro.bench.ts and bench/http.bench.ts · NestJS 12.3 · RxJS 7.8');
}
