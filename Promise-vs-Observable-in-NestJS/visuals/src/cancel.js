import { C, svg, el, hbar, text, title, footnote, progress, ease, clamp } from './lib.js';

export const meta = { width: 680, height: 420, duration: 9, fps: 20, poster: 9 };

// bench/results/cancellation.json: 50 requests per variant, client gives up after 200 ms,
// the downstream call needs 2 s
const lanes = [
  { label: 'Promise', sub: 'plain async/await', color: C.promise, stops: false, result: '50 of 50 finished' },
  { label: 'Promise + AbortSignal', sub: 'signal passed by hand', color: C.signal, stops: true, result: '50 of 50 stopped' },
  { label: 'Observable', sub: 'NestJS 12.1+', color: C.observable, stops: true, result: '50 of 50 stopped' },
];

const CLOSE_AT = 0.2; // seconds of simulated time
const TOTAL = 2.0;

/** Real time -> simulated time, with a pause on the interesting moment. */
function simTime(t) {
  if (t < 0.6) return 0;
  if (t < 1.8) return CLOSE_AT * ease(progress(t, 0.6, 1.8));
  if (t < 2.8) return CLOSE_AT;
  return CLOSE_AT + (TOTAL - CLOSE_AT) * progress(t, 2.8, 6.4);
}

export function render(t) {
  const s = svg(meta.width, meta.height);
  title(s, 24, 36, 'The user left. Is your server still working?', 'One request each. The downstream call needs 2 s, the client gives up after 200 ms.');

  // Hatch for "work nobody is waiting for" (texture at 45°)
  const defs = el(s, 'defs');
  const pat = el(defs, 'pattern', { id: 'waste', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
  el(pat, 'rect', { width: 6, height: 6, fill: C.promiseWash });
  el(pat, 'line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: C.promise, 'stroke-width': 2.2 });

  const x0 = 206;
  const x1 = 516;
  const sx = (sec) => x0 + (sec / TOTAL) * (x1 - x0);
  const top = 104;
  const band = 78;
  const barH = 22;
  const bottom = top + band * lanes.length;
  const now = simTime(t);

  for (const tick of [0, 0.5, 1, 1.5, 2]) {
    el(s, 'line', { x1: sx(tick), x2: sx(tick), y1: top - 10, y2: bottom - 18, stroke: tick === 0 ? C.axis : C.grid, 'stroke-width': 1 });
    text(s, sx(tick), bottom, tick === 0 ? '0 s' : `${tick} s`, { size: 11.5, fill: C.muted, anchor: 'middle', tabular: true });
  }

  // Client closes the tab
  const closed = now >= CLOSE_AT;
  if (closed) {
    const a = clamp(progress(t, 1.8, 2.2));
    const g = el(s, 'g', { opacity: a });
    el(g, 'line', { x1: sx(CLOSE_AT), x2: sx(CLOSE_AT), y1: top - 22, y2: bottom - 18, stroke: C.critical, 'stroke-width': 1.5 });
    el(g, 'circle', { cx: sx(CLOSE_AT), cy: top - 22, r: 7, fill: C.critical });
    text(g, sx(CLOSE_AT), top - 21.5, '×', { size: 12, weight: 700, fill: '#ffffff', anchor: 'middle', baseline: 'middle' });
    text(g, sx(CLOSE_AT) + 12, top - 21, 'Client closes the tab (200 ms)', { size: 12.5, weight: 600, baseline: 'middle' });
  }

  lanes.forEach((lane, i) => {
    const y = top + i * band + 6;
    text(s, 24, y + 8, lane.label, { size: 14, weight: 600, baseline: 'middle' });
    text(s, 24, y + 26, lane.sub, { size: 12, fill: C.muted, baseline: 'middle' });

    el(s, 'rect', { x: x0, y, width: x1 - x0, height: barH, rx: 4, fill: C.wash });

    const useful = Math.min(now, CLOSE_AT);
    hbar(s, x0, y, sx(useful) - x0, barH, lane.color);

    if (!lane.stops && now > CLOSE_AT) {
      // The call keeps going after nobody is waiting
      const w = sx(now) - sx(CLOSE_AT);
      const r = Math.min(4, w / 2);
      el(s, 'path', {
        d: `M${sx(CLOSE_AT) + 2},${y} H${sx(now) - r} Q${sx(now)},${y} ${sx(now)},${y + r} V${y + barH - r} Q${sx(now)},${y + barH} ${sx(now) - r},${y + barH} H${sx(CLOSE_AT) + 2} Z`,
        fill: 'url(#waste)',
      });
      if (now > 0.75) {
        text(s, sx(CLOSE_AT) + 10, y + barH + 16, `still running: ${(now - CLOSE_AT).toFixed(1)} s for nobody`, {
          size: 12, fill: C.ink2, baseline: 'middle', tabular: true,
        });
      }
    }

    if (lane.stops && closed) {
      const a = clamp(progress(t, 2.0, 2.4));
      const g = el(s, 'g', { opacity: a });
      text(g, sx(CLOSE_AT) + 10, y + barH / 2 + 1, '✕ aborted, call stopped', { size: 12.5, fill: C.ink, baseline: 'middle' });
    }

    // Result for all 50 requests, shown at the end
    const done = clamp(progress(t, 6.6, 7.2));
    if (done > 0) {
      const g = el(s, 'g', { opacity: done });
      text(g, x1 + 16, y + barH / 2 + 1, lane.result, { size: 12.5, weight: 600, baseline: 'middle' });
    }
  });

  // Playhead
  if (now > 0 && now < TOTAL) {
    el(s, 'line', { x1: sx(now), x2: sx(now), y1: top - 10, y2: bottom - 18, stroke: C.ink, 'stroke-width': 1, opacity: 0.35 });
  }

  const summary = clamp(progress(t, 7.0, 7.6));
  if (summary > 0) {
    text(el(s, 'g', { opacity: summary }), 24, bottom + 34, 'Real run, 50 requests each: with a plain Promise, all 50 downstream calls ran the full 2 s.', {
      size: 12.5, fill: C.ink2,
    });
  }
  footnote(s, 24, meta.height - 12, 'bench/cancellation.bench.ts · NestJS 12.3 · On NestJS 12.0 the Observable row behaves like Promise');
}
