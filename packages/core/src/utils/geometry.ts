export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const EPSILON = 1e-6;

export function right(r: Rect): number {
  return r.x + r.width;
}

export function bottom(r: Rect): number {
  return r.y + r.height;
}

export function area(r: Rect): number {
  return r.width * r.height;
}

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function withinBounds(r: Rect): boolean {
  return (
    r.x >= -EPSILON &&
    r.y >= -EPSILON &&
    r.width >= 0 &&
    r.height >= 0 &&
    right(r) <= 100 + EPSILON &&
    bottom(r) <= 100 + EPSILON
  );
}

export function overlapArea(a: Rect, b: Rect): number {
  const xOverlap = Math.max(0, Math.min(right(a), right(b)) - Math.max(a.x, b.x));
  const yOverlap = Math.max(0, Math.min(bottom(a), bottom(b)) - Math.max(a.y, b.y));
  return xOverlap * yOverlap;
}

export function overlaps(a: Rect, b: Rect): boolean {
  return overlapArea(a, b) > EPSILON;
}

export function approxEqual(a: number, b: number, eps = EPSILON): boolean {
  return Math.abs(a - b) <= eps;
}

export function adjacent(a: Rect, b: Rect): boolean {
  const verticalTouch = Math.abs(right(a) - b.x) <= EPSILON || Math.abs(right(b) - a.x) <= EPSILON;
  const verticalOverlap =
    Math.max(0, Math.min(bottom(a), bottom(b)) - Math.max(a.y, b.y)) > EPSILON;

  const horizontalTouch =
    Math.abs(bottom(a) - b.y) <= EPSILON || Math.abs(bottom(b) - a.y) <= EPSILON;
  const horizontalOverlap =
    Math.max(0, Math.min(right(a), right(b)) - Math.max(a.x, b.x)) > EPSILON;

  return (verticalTouch && verticalOverlap) || (horizontalTouch && horizontalOverlap);
}
