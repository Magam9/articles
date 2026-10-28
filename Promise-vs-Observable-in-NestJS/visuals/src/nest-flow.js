import { C, svg, el, text, title, footnote } from './lib.js';

export const meta = { width: 680, height: 478 };

function box(s, x, y, w, h, opts = {}) {
  el(s, 'rect', { x, y, width: w, height: h, rx: 10, fill: opts.fill ?? '#ffffff', stroke: opts.stroke ?? C.grid, 'stroke-width': 1 });
  if (opts.accent) el(s, 'rect', { x, y: y + 8, width: 4, height: h - 16, rx: 2, fill: opts.accent });
}

function arrow(s, x1, y1, x2, y2, color = C.axis) {
  el(s, 'line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 1.5 });
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 7;
  el(s, 'path', {
    d: `M${x2},${y2} L${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)} Z`,
    fill: color,
  });
}

export function render() {
  const s = svg(meta.width, meta.height);
  title(s, 24, 36, 'What Nest does with your return value', 'Normal HTTP routes, NestJS 12.3');

  // Column A: what the handler returns
  const ax = 24;
  const aw = 160;
  const rows = [
    { label: 'a plain value', code: 'return { ok: true }', accent: C.muted },
    { label: 'a Promise', code: 'async … await', accent: C.promise },
    { label: 'an Observable', code: 'return of(…)', accent: C.observable },
  ];
  text(s, ax, 92, 'Your handler returns', { size: 12.5, fill: C.muted });
  rows.forEach((r, i) => {
    const y = 104 + i * 62;
    box(s, ax, y, aw, 50, { accent: r.accent });
    text(s, ax + 16, y + 21, r.label, { size: 13.5, weight: 600 });
    text(s, ax + 16, y + 39, r.code, { size: 11.5, mono: true, fill: C.ink2 });
    arrow(s, ax + aw, y + 25, 236, 196);
  });

  // Column B: interceptors
  const bx = 240;
  const bw = 180;
  box(s, bx, 140, bw, 112, { fill: C.observableWash, stroke: 'none' });
  text(s, bx + 16, 166, 'Interceptors, if any', { size: 13.5, weight: 600 });
  text(s, bx + 16, 190, 'next.handle()', { size: 12, mono: true });
  text(s, bx + 16, 212, 'is always an Observable,', { size: 12, fill: C.ink2 });
  text(s, bx + 16, 230, 'even for async handlers', { size: 12, fill: C.ink2 });
  arrow(s, bx + bw, 196, 472, 196);

  // Column C: router
  const cx = 476;
  const cw = 180;
  box(s, cx, 140, cw, 112);
  text(s, cx + 16, 166, 'Nest router', { size: 13.5, weight: 600 });
  text(s, cx + 16, 190, 'lastValueFrom(result)', { size: 12, mono: true });
  text(s, cx + 16, 212, 'waits for completion and', { size: 12, fill: C.ink2 });
  text(s, cx + 16, 230, 'sends the last value', { size: 12, fill: C.ink2 });
  arrow(s, cx + cw / 2, 252, cx + cw / 2, 292);
  box(s, cx, 296, cw, 44, { fill: C.wash, stroke: 'none' });
  text(s, cx + cw / 2, 323, 'HTTP response', { size: 13, weight: 600, anchor: 'middle' });

  // Disconnect path
  const dy = 372;
  el(s, 'line', { x1: 24, x2: 656, y1: dy - 16, y2: dy - 16, stroke: C.grid, 'stroke-width': 1 });
  el(s, 'circle', { cx: 34, cy: dy + 14, r: 8, fill: C.critical });
  text(s, 34, dy + 14.5, '×', { size: 13, weight: 700, fill: '#ffffff', anchor: 'middle', baseline: 'middle' });
  text(s, 50, dy + 10, 'Client disconnects', { size: 13, weight: 600 });
  text(s, 50, dy + 28, 'NestJS 12.1+', { size: 12, fill: C.muted });
  arrow(s, 190, dy + 14, 236, dy + 14);
  box(s, 240, dy - 6, 200, 42, { accent: C.observable });
  text(s, 256, dy + 11, 'Observable: unsubscribe()', { size: 12.5, weight: 600 });
  text(s, 256, dy + 27, 'your teardown runs', { size: 12, fill: C.ink2 });
  // Second branch goes under the first box to the Promise outcome
  el(s, 'path', { d: `M214,${dy + 14} V${dy + 56} H558 V${dy + 42}`, fill: 'none', stroke: C.axis, 'stroke-width': 1.5 });
  arrow(s, 558, dy + 50, 558, dy + 40);
  box(s, 460, dy - 6, 196, 42, { accent: C.promise });
  text(s, 476, dy + 11, 'Promise: keeps running', { size: 12.5, weight: 600 });
  text(s, 476, dy + 27, 'unless you pass a signal', { size: 12, fill: C.ink2 });

  footnote(s, 24, meta.height - 12, 'node_modules/@nestjs/core/router/router-execution-context.js');
}
