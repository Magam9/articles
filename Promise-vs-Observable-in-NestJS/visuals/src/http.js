import { C, svg, el, vbar, text, legend, title, footnote, fmt } from './lib.js';

export const meta = { width: 680, height: 420 };

// bench/results/http.json, median req/sec of 3 runs
const panels = [
  {
    title: 'Empty endpoint',
    sub: 'pure framework overhead',
    max: 8000,
    ticks: [0, 2000, 4000, 6000, 8000],
    groups: [
      { label: 'No interceptor', promise: 6833, observable: 5971 },
      { label: 'One interceptor', promise: 5686, observable: 5151 },
    ],
  },
  {
    title: 'Dashboard',
    sub: '3 downstream calls, retry, fallback',
    max: 600,
    ticks: [0, 150, 300, 450, 600],
    groups: [
      { label: 'No interceptor', promise: 529, observable: 506 },
      { label: 'One interceptor', promise: 517, observable: 499 },
    ],
  },
];

const compact = (v) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}K` : `${v}`);

export function render() {
  const s = svg(meta.width, meta.height);
  title(s, 24, 36, 'Throughput: close, but not equal', 'Requests per second, median of 3 runs, 50 connections. Higher is better.');
  legend(s, 24, 96, [
    { label: 'async/await', color: C.promise },
    { label: 'RxJS', color: C.observable },
  ]);

  const panelW = 300;
  const gap = 32;
  const plotTop = 168;
  const baseY = 340;
  const barW = 24;

  panels.forEach((panel, p) => {
    const px = 24 + p * (panelW + gap);
    text(s, px, 132, panel.title, { size: 14.5, weight: 600 });
    text(s, px, 150, panel.sub, { size: 12, fill: C.muted });

    const axisX = px + 36;
    const sy = (v) => baseY - (v / panel.max) * (baseY - plotTop);

    for (const tick of panel.ticks) {
      el(s, 'line', { x1: axisX, x2: px + panelW, y1: sy(tick), y2: sy(tick), stroke: tick === 0 ? C.axis : C.grid, 'stroke-width': 1 });
      text(s, axisX - 8, sy(tick) + 4, compact(tick), { size: 11.5, fill: C.muted, anchor: 'end', tabular: true });
    }

    const slot = (panelW - 36) / panel.groups.length;
    panel.groups.forEach((g, i) => {
      const cx = axisX + slot * i + slot / 2;
      vbar(s, cx - barW - 1, baseY, barW, baseY - sy(g.promise), C.promise);
      vbar(s, cx + 1, baseY, barW, baseY - sy(g.observable), C.observable);
      const label = (v) => (panel.max >= 1000 ? `${(v / 1000).toFixed(1)}K` : fmt(v));
      text(s, cx - barW / 2 - 1, sy(g.promise) - 8, label(g.promise), { size: 11.5, fill: C.ink2, anchor: 'middle', tabular: true });
      text(s, cx + barW / 2 + 1, sy(g.observable) - 8, label(g.observable), { size: 11.5, fill: C.ink2, anchor: 'middle', tabular: true });
      text(s, cx, baseY + 20, g.label, { size: 12.5, fill: C.ink2, anchor: 'middle' });
      const diff = Math.round((1 - g.observable / g.promise) * 100);
      text(s, cx, baseY + 38, `RxJS −${diff}%`, { size: 12, weight: 600, anchor: 'middle' });
    });
  });

  footnote(s, 24, meta.height - 12, 'autocannon · 2 vCPU VM shared by load generator, app and fake API · bench/http.bench.ts');
}
