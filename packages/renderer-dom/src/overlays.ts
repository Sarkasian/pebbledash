import type { BoundaryGroup } from '@pebbledash/core/internal';

export function dedupeEdges<
  T extends {
    orientation: 'vertical' | 'horizontal';
    x: number;
    y: number;
    width: number;
    height: number;
  },
>(edges: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of edges) {
    const key =
      e.orientation === 'vertical'
        ? `v|${e.x.toFixed(4)}|${e.y.toFixed(4)}|${e.height.toFixed(4)}`
        : `h|${e.y.toFixed(4)}|${e.x.toFixed(4)}|${e.width.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function clearBoundaryOverlays(container: HTMLElement): void {
  container.querySelectorAll('.ud-boundary').forEach((n) => n.remove());
}

export function renderBoundaryGroup(
  container: HTMLElement,
  group: BoundaryGroup | null | undefined,
): void {
  clearBoundaryOverlays(container);
  if (!group) return;
  for (let i = 0; i < group.boundaries.length; i++) {
    const b = group.boundaries[i];
    if (!b) continue;
    const el = document.createElement('div');
    el.className = 'ud-boundary';
    el.setAttribute('data-boundary-id', b.id);
    if (b.orientation === 'vertical') el.classList.add('ud-vertical');
    else el.classList.add('ud-horizontal');
    el.style.position = 'absolute';
    el.style.left = `${b.x}%`;
    el.style.top = `${b.y}%`;
    if (b.orientation === 'vertical') el.style.height = `${b.height}%`;
    else el.style.width = `${b.width}%`;
    if (i === group.focusedIndex) {
      el.classList.add('active');
      el.style.zIndex = '13';
    }
    container.appendChild(el);
  }
}

export function updateFocusedBoundary(container: HTMLElement, boundary: { id: string }): void {
  const els = container.querySelectorAll('.ud-boundary');
  els.forEach((n) => n.classList.remove('active'));
  const active = Array.from(els).find(
    (n) => (n as HTMLElement).getAttribute('data-boundary-id') === boundary.id,
  );
  if (active) active.classList.add('active');
}
