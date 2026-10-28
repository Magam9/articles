import { C, svg, el, text, title, footnote } from './lib.js';

export const meta = { width: 680, height: 536 };

function arrow(s, x1, y1, x2, y2) {
  el(s, 'line', { x1, y1, x2, y2, stroke: C.axis, 'stroke-width': 1.5 });
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 7;
  el(s, 'path', {
    d: `M${x2},${y2} L${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)} Z`,
    fill: C.axis,
  });
}

const steps = [
  {
    q: 'Is the data a stream?',
    hint: 'SSE, WebSockets, events, interceptors',
    answer: 'Observable',
    why: "It's the right shape, not a style choice",
    color: C.observable,
  },
  {
    q: 'Can the user walk away from slow work?',
    hint: 'slow downstream calls, heavy reports',
    answer: 'Observable with teardown',
    why: 'or async/await + an AbortSignal',
    color: C.observable,
  },
  {
    q: 'Retries, timeouts and limits everywhere?',
    hint: 'lots of composition around the same calls',
    answer: 'RxJS operators help',
    why: 'if the whole team knows them well',
    color: C.observable,
  },
];

export function render() {
  const s = svg(meta.width, meta.height);
  title(s, 24, 36, 'Which one should I use?', 'The rule of thumb I ended up with after the benchmarks.');

  const qx = 24;
  const qw = 300;
  const ax = 372;
  const aw = 284;
  const top = 80;
  const step = 98;

  steps.forEach((st, i) => {
    const y = top + i * step;
    el(s, 'rect', { x: qx, y, width: qw, height: 64, rx: 10, fill: '#ffffff', stroke: C.grid });
    text(s, qx + 16, y + 26, st.q, { size: 14, weight: 600 });
    text(s, qx + 16, y + 46, st.hint, { size: 12, fill: C.muted });

    arrow(s, qx + qw, y + 32, ax - 4, y + 32);
    text(s, (qx + qw + ax) / 2, y + 24, 'yes', { size: 12, fill: C.ink2, anchor: 'middle' });

    el(s, 'rect', { x: ax, y, width: aw, height: 64, rx: 10, fill: C.observableWash });
    el(s, 'rect', { x: ax, y: y + 8, width: 4, height: 48, rx: 2, fill: st.color });
    text(s, ax + 16, y + 26, st.answer, { size: 14, weight: 600 });
    text(s, ax + 16, y + 46, st.why, { size: 12, fill: C.ink2 });

    arrow(s, qx + 40, y + 64, qx + 40, y + step - 4);
    text(s, qx + 50, y + 82, 'no', { size: 12, fill: C.ink2 });
  });

  const y = top + steps.length * step;
  el(s, 'rect', { x: qx, y, width: 632, height: 64, rx: 10, fill: C.promiseWash });
  el(s, 'rect', { x: qx, y: y + 8, width: 4, height: 48, rx: 2, fill: C.promise });
  text(s, qx + 16, y + 26, 'async/await', { size: 15, weight: 600 });
  text(s, qx + 16, y + 46, 'The default for services, repositories and business logic. Faster to read and easier to debug.', {
    size: 12, fill: C.ink2,
  });

  const by = y + 100;
  text(s, qx, by, 'Where the two worlds meet', { size: 13, weight: 600 });
  text(s, qx, by + 22, 'firstValueFrom(obs$)  ·  lastValueFrom(obs$)  ·  from(promise)', { size: 12.5, mono: true, fill: C.ink2 });
  footnote(s, 24, meta.height - 12, 'Convert at the boundaries. Don’t return an Observable just because the controller can handle one.');
}
