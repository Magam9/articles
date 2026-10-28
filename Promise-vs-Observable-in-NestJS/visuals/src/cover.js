import { C, svg, el, text } from './lib.js';

// Seamless 4 s loop; frame 0 is already a complete picture (Medium uses it as the thumbnail)
export const meta = { width: 680, height: 382, duration: 4, fps: 20, poster: 0 };

const LOOP = 4;

export function render(t) {
  const s = svg(meta.width, meta.height);
  el(s, 'rect', { x: 0, y: 0, width: meta.width, height: meta.height, fill: '#ffffff' });

  text(s, 40, 70, 'NestJS', { size: 15, weight: 600, fill: C.muted, spacing: '0.04em' });
  text(s, 40, 112, 'Promise vs Observable', { size: 36, weight: 700 });
  text(s, 40, 146, 'The same endpoints, written twice and measured', { size: 17, fill: C.ink2 });

  const x0 = 170;
  const x1 = 570;
  const phase = (t % LOOP) / LOOP;

  // Lane 1: a Promise settles once
  const y1 = 226;
  text(s, 40, y1 + 5, 'async/await', { size: 14, weight: 600 });
  el(s, 'line', { x1: x0, x2: x1, y1, y2: y1, stroke: C.axis, 'stroke-width': 2, 'stroke-linecap': 'round' });
  const px = x0 + (x1 - x0 - 20) * phase;
  el(s, 'circle', { cx: px, cy: y1, r: 11, fill: C.promise, stroke: '#ffffff', 'stroke-width': 2 });
  el(s, 'line', { x1: x1, x2: x1, y1: y1 - 12, y2: y1 + 12, stroke: C.ink2, 'stroke-width': 2, 'stroke-linecap': 'round' });
  text(s, x1 + 10, y1 + 5, 'one value', { size: 12, fill: C.muted });

  // Lane 2: an Observable is a stream that can be cut short
  const y2 = 300;
  text(s, 40, y2 + 5, 'RxJS', { size: 14, weight: 600 });
  el(s, 'line', { x1: x0, x2: x1, y1: y2, y2: y2, stroke: C.axis, 'stroke-width': 2, 'stroke-linecap': 'round' });
  const spacing = (x1 - x0) / 5;
  for (let k = 0; k < 6; k++) {
    const x = x0 + ((k * spacing + phase * spacing) % (x1 - x0 + spacing)) - 10;
    if (x < x0 - 2 || x > x1 - 14) continue;
    el(s, 'circle', { cx: x, cy: y2, r: 11, fill: C.observable, stroke: '#ffffff', 'stroke-width': 2 });
  }
  el(s, 'circle', { cx: x1, cy: y2, r: 9, fill: '#ffffff', stroke: C.critical, 'stroke-width': 2 });
  text(s, x1, y2 + 0.5, '×', { size: 13, weight: 700, fill: C.critical, anchor: 'middle', baseline: 'middle' });
  text(s, x1 + 16, y2 + 5, 'cancel', { size: 12, fill: C.muted });

  text(s, 40, meta.height - 24, 'speed · cancellation · scaling · readability', { size: 13, fill: C.muted });
}
