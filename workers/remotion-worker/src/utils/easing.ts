// ── Easing curves (industry-standard from easings.net) ──
// Used everywhere to make motion feel physical and cinematic, not linear/robotic.

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeInOutQuart = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// Remap a frame into normalized 0..1 progress between start and end.
// Clamps automatically — safe to use for entry/exit windows.
export const progress = (frame: number, start: number, end: number): number => {
  if (end <= start) return frame >= start ? 1 : 0;
  if (frame <= start) return 0;
  if (frame >= end) return 1;
  return (frame - start) / (end - start);
};

// Symmetric impulse — 0 → 1 → 0 across the range (good for punch/flash).
export const impulse = (frame: number, start: number, end: number): number => {
  const p = progress(frame, start, end);
  return Math.sin(p * Math.PI);
};
