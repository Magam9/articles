// Tiny helpers shared by every visual. Each page defines window.render(t) and window.VISUAL.
export const C = {
  surface: '#ffffff',
  ink: '#0b0b0b',
  ink2: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  wash: '#f4f3ef',
  promise: '#2a78d6',
  promiseWash: '#e6f0fb',
  observable: '#eb6834',
  observableWash: '#fdede6',
  signal: '#1baf7a',
  signalWash: '#e3f6ef',
  critical: '#d03b3b',
};

const NS = 'http://www.w3.org/2000/svg';

export function svg(width, height) {
  const root = document.createElementNS(NS, 'svg');
  root.setAttribute('width', width);
  root.setAttribute('height', height);
  root.setAttribute('viewBox', `0 0 ${width} ${height}`);
  document.getElementById('stage').replaceChildren(root);
  return root;
}

export function el(parent, tag, attrs = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  parent.appendChild(node);
  return node;
}

/** Horizontal bar: square at the baseline (x), 4px rounded data-end. */
export function hbar(parent, x, y, w, h, fill) {
  const r = Math.min(4, w / 2, h / 2);
  if (w <= 0) return;
  const d = `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`;
  return el(parent, 'path', { d, fill });
}

/** Vertical column: square at the baseline, 4px rounded top. */
export function vbar(parent, x, baseY, w, h, fill) {
  if (h <= 0) return;
  const r = Math.min(4, w / 2, h);
  const top = baseY - h;
  const d = `M${x},${baseY} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${baseY} Z`;
  return el(parent, 'path', { d, fill });
}

export function text(parent, x, y, str, opts = {}) {
  return el(
    parent,
    'text',
    {
      x,
      y,
      fill: opts.fill ?? C.ink,
      'font-size': opts.size ?? 13,
      'font-weight': opts.weight ?? 400,
      'text-anchor': opts.anchor ?? 'start',
      'dominant-baseline': opts.baseline ?? 'alphabetic',
      'font-family': opts.mono ? 'JetBrains Mono, DejaVu Sans Mono, monospace' : 'Inter, system-ui, sans-serif',
      'font-variant-numeric': opts.tabular ? 'tabular-nums' : undefined,
      opacity: opts.opacity,
      'letter-spacing': opts.spacing,
    },
    str
  );
}

/** Legend row: swatch + label, text in ink (never series color). */
export function legend(parent, x, y, items) {
  let cx = x;
  for (const item of items) {
    el(parent, 'rect', { x: cx, y: y - 9, width: 12, height: 12, rx: 3, fill: item.color });
    const t = text(parent, cx + 18, y + 1, item.label, { size: 13, fill: C.ink2 });
    cx += 18 + t.getComputedTextLength() + 22;
  }
}

export function title(parent, x, y, main, sub) {
  text(parent, x, y, main, { size: 19, weight: 600 });
  if (sub) text(parent, x, y + 22, sub, { size: 13.5, fill: C.ink2 });
}

export function footnote(parent, x, y, str) {
  text(parent, x, y, str, { size: 11.5, fill: C.muted });
}

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const progress = (t, start, end) => clamp((t - start) / (end - start));
export const fmt = (n) => n.toLocaleString('en-US');
