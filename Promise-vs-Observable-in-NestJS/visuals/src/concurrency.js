import { C, svg, el, text, title, footnote, progress, ease, clamp } from './lib.js';

export const meta = { width: 680, height: 430, duration: 11, fps: 20, poster: 11 };

const N = 20;
const LIMIT = 5;
// Illustrative response times (seconds of animation), deterministic so every render matches
const durations = Array.from({ length: N }, (_, i) => 0.55 + (((i * 7919) % 13) / 13) * 0.9);

// Simulate a pool of 5: each request starts as soon as a slot is free
const jobs = [];
const slotFree = Array(LIMIT).fill(0);
for (let i = 0; i < N; i++) {
  const slot = slotFree.indexOf(Math.min(...slotFree));
  const start = slotFree[slot];
  const end = start + durations[i];
  slotFree[slot] = end;
  jobs.push({ i, slot, start, end });
}
const finishOrder = [...jobs].sort((a, b) => a.end - b.end).map((j) => j.i);
const SIM_END = Math.max(...jobs.map((j) => j.end));

const SIM_START_REAL = 0.8;
const SIM_SPEED = 1.15; // real seconds per simulated second
const simAt = (t) => Math.max(0, (t - SIM_START_REAL) / SIM_SPEED);
const SORT_START = SIM_START_REAL + SIM_END * SIM_SPEED + 1.0;

const TOKEN = 26;
const GAP = 6;
const gridPos = (x, y, k) => ({ x: x + (k % 5) * (TOKEN + GAP), y: y + Math.floor(k / 5) * (TOKEN + GAP) });

export function render(t) {
  const s = svg(meta.width, meta.height);
  title(s, 24, 36, 'Never more than five requests in flight', 'mergeMap(fn, 5) or a small worker pool. Results arrive in the order they finish.');

  const sim = simAt(t);
  const top = 118;
  const queueX = 24;
  const slotsX = 220;
  const slotsW = 210;
  const doneX = 494;

  text(s, queueX, top - 16, 'Waiting', { size: 13, weight: 600 });
  text(s, slotsX, top - 16, 'In flight', { size: 13, weight: 600 });
  text(s, doneX, top - 16, 'Done', { size: 13, weight: 600 });

  const inFlight = jobs.filter((j) => sim >= j.start && sim < j.end).length;
  text(s, slotsX + slotsW, top - 16, `${inFlight} / ${LIMIT}`, { size: 13, weight: 600, anchor: 'end', tabular: true });

  // Slot lanes
  for (let k = 0; k < LIMIT; k++) {
    const y = top + k * (TOKEN + 12);
    el(s, 'rect', { x: slotsX, y, width: slotsW, height: TOKEN, rx: 6, fill: C.wash });
  }

  const sortP = ease(progress(t, SORT_START, SORT_START + 1.4));

  for (const job of jobs) {
    let pos;
    let state;
    if (sim < job.start) {
      // queued: keep the queue compact, shifting left as requests leave
      const waitingBefore = jobs.filter((j) => j.i < job.i && sim < j.start).length;
      pos = gridPos(queueX, top, waitingBefore);
      state = 'queued';
    } else if (sim < job.end) {
      pos = { x: slotsX + 4, y: top + job.slot * (TOKEN + 12) };
      state = 'flight';
      const p = (sim - job.start) / (job.end - job.start);
      el(s, 'rect', { x: slotsX + TOKEN + 12, y: pos.y + TOKEN / 2 - 3, width: (slotsW - TOKEN - 24) * p, height: 6, rx: 3, fill: C.observable });
    } else {
      const byFinish = gridPos(doneX, top, finishOrder.indexOf(job.i));
      const byIndex = gridPos(doneX, top, job.i);
      pos = { x: byFinish.x + (byIndex.x - byFinish.x) * sortP, y: byFinish.y + (byIndex.y - byFinish.y) * sortP };
      state = 'done';
    }

    // Short slide when a token arrives in a new place
    const fill = state === 'done' ? C.ink2 : state === 'flight' ? C.observable : '#ffffff';
    const stroke = state === 'queued' ? C.axis : 'none';
    el(s, 'rect', { x: pos.x, y: pos.y, width: TOKEN, height: TOKEN, rx: 6, fill, stroke, 'stroke-width': 1 });
    text(s, pos.x + TOKEN / 2, pos.y + TOKEN / 2 + 1, String(job.i + 1), {
      size: 11.5, weight: 600, anchor: 'middle', baseline: 'middle', fill: state === 'queued' ? C.ink2 : '#ffffff', tabular: true,
    });
  }

  // Caption under "Done"
  const doneCount = jobs.filter((j) => sim >= j.end).length;
  const captionY = top + 4 * (TOKEN + GAP) + 26;
  if (doneCount === N && sortP === 0) {
    text(s, doneX, captionY, 'Finish order, not request order', { size: 12, fill: C.ink2 });
  } else if (sortP > 0) {
    const g = el(s, 'g', { opacity: clamp(sortP * 2) });
    text(g, doneX, captionY, 'toArray() + sort by index', { size: 12, fill: C.ink2 });
    text(g, doneX, captionY + 18, 'restores 1 … 20', { size: 12, fill: C.ink2 });
  }

  // Code hint
  const codeY = top + LIMIT * (TOKEN + 12) + 30;
  el(s, 'rect', { x: 24, y: codeY - 20, width: 632, height: 58, rx: 8, fill: C.wash });
  text(s, 40, codeY, 'from(ids).pipe(mergeMap((id, index) => load$(id), 5), toArray(), …)', { size: 12.5, mono: true });
  text(s, 40, codeY + 22, 'const worker = async () => { while (next < ids.length) { … } }   // ×5', { size: 12.5, mono: true, fill: C.ink2 });

  footnote(s, 24, meta.height - 12, 'Illustration with varied response times · same logic as getUsers() in both services');
}
