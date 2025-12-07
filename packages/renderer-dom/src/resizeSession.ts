import type { DashboardModel, TileId } from '@pebbledash/core';

type ResizeEdge = 'left' | 'right' | 'top' | 'bottom';

interface EdgeData {
  tileId: TileId;
  side: ResizeEdge;
  orientation: 'vertical' | 'horizontal';
  x: number;
  y: number;
  width: number;
  height: number;
  seamId?: string;
}

export interface ResizeSessionHooks {
  model: DashboardModel;
  renderer: { render?: () => void };
  container: HTMLElement;
  el: HTMLElement;
  edge: EdgeData;
  startX: number;
  startY: number;
  onSessionStart(): void;
  onSessionEnd(): void;
  clearBoundaryOverlays(): void;
  rebuildOverlays(): void;
}

const CLAMP_DEADBAND_PX = 1;
const APPLY_EPS = 0.01;

export function startResizeSession(hooks: ResizeSessionHooks, pointerId: number) {
  const { model, renderer, container, el, edge } = hooks;
  const startX = hooks.startX;
  const startY = hooks.startY;
  const isVertical = edge.side === 'left' || edge.side === 'right';
  let lastPointerX = startX;
  let lastPointerY = startY;
  let lastApplied = 0;
  let running = true;
  let processing = false;
  let rafId = 0;
  let lockedAtLimit = false;
  let lastPreviewPx = 0;
  let lastOob = false;

  const onMove = (eMove: PointerEvent) => {
    lastPointerX = eMove.clientX;
    lastPointerY = eMove.clientY;
    if (running && !rafId)
      rafId = requestAnimationFrame(() => {
        void tick();
      });
  };

  const onUp = (eUp: PointerEvent) => {
    try {
      el.releasePointerCapture(pointerId);
    } catch {}
    eUp.preventDefault();
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    el.style.transform = '';
    hooks.onSessionEnd();
    hooks.clearBoundaryOverlays();
    hooks.rebuildOverlays();
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
  };

  const tick = async () => {
    rafId = 0;
    if (!running) return;
    const rect = container.getBoundingClientRect();
    const dxPct = ((lastPointerX - startX) / rect.width) * 100;
    const dyPct = ((lastPointerY - startY) / rect.height) * 100;
    const cursorDelta = isVertical ? dxPct : dyPct;
    // Get live clamp from current state for the resize operation
    const clamp = model.clampResize(edge.tileId, {
      edge: edge.side,
      delta: cursorDelta,
    });
    // Compute live bounds in session-relative coordinates
    const liveMin = clamp.min + lastApplied;
    const liveMax = clamp.max + lastApplied;
    // Use live bounds directly instead of tightening session bounds,
    // which prevents drift when moving back and forward
    const clampedTarget = Math.max(liveMin, Math.min(liveMax, cursorDelta));
    const overshoot = cursorDelta - clampedTarget;
    const diffPx = (Math.abs(overshoot) * (isVertical ? rect.width : rect.height)) / 100;
    const isOob = diffPx > CLAMP_DEADBAND_PX;
    if (isOob) {
      if (!lockedAtLimit) {
        lockedAtLimit = true;
      }
      if (!lastOob) {
        el.classList.add('edge--oob');
        lastOob = true;
      }
    } else {
      lockedAtLimit = false;
      if (lastOob) {
        el.classList.remove('edge--oob');
        lastOob = false;
      }
    }
    const previewShiftPct = lockedAtLimit ? 0 : clampedTarget - lastApplied;
    const px = (isVertical ? rect.width : rect.height) * (previewShiftPct / 100);
    if (Math.abs(px - lastPreviewPx) > 0.05) {
      el.style.transform = isVertical ? `translateX(${px}px)` : `translateY(${px}px)`;
      lastPreviewPx = px;
    }
    const deltaToApply = clampedTarget - lastApplied;
    const rangeZero = Math.abs(liveMax - liveMin) <= APPLY_EPS;
    if (rangeZero && isOob) {
      el.classList.add('edge--oob');
    }
    if (Math.abs(deltaToApply) <= APPLY_EPS || lockedAtLimit || processing) {
      if (lockedAtLimit) {
        el.style.transform = '';
        lastPreviewPx = 0;
      }
      if (running && !rafId)
        rafId = requestAnimationFrame(() => {
          void tick();
        });
      return;
    }
    processing = true;
    try {
      const res = await model.resizeTile(edge.tileId, {
        edge: edge.side,
        delta: deltaToApply,
      });
      if (res.valid) {
        lastApplied = clampedTarget;
        renderer.render?.();
        const updatedTile = model.getState().tiles.get(edge.tileId);
        if (updatedTile) {
          if (isVertical) {
            const seamX = edge.side === 'left' ? updatedTile.x : updatedTile.x + updatedTile.width;
            el.style.left = `${seamX}%`;
            el.style.top = `${updatedTile.y}%`;
            el.style.height = `${updatedTile.height}%`;
          } else {
            const seamY = edge.side === 'top' ? updatedTile.y : updatedTile.y + updatedTile.height;
            el.style.top = `${seamY}%`;
            el.style.left = `${updatedTile.x}%`;
            el.style.width = `${updatedTile.width}%`;
          }
        }
        el.style.transform = '';
        lastPreviewPx = 0;
      }
    } finally {
      processing = false;
    }
    if (running && !rafId)
      rafId = requestAnimationFrame(() => {
        void tick();
      });
  };

  hooks.onSessionStart();
  try {
    el.setPointerCapture(pointerId);
  } catch {}
  el.addEventListener('pointermove', onMove, { passive: false });
  el.addEventListener('pointerup', onUp, { passive: false });
  el.addEventListener('pointercancel', onUp, { passive: false });
  if (!rafId)
    rafId = requestAnimationFrame(() => {
      void tick();
    });
}
