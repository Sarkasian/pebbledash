import type { DashboardModel, TileId } from '@pebbledash/core';
import { InsertionNavigator, type HoverEdge } from '@pebbledash/core/internal';

type ResizeEdge = 'left' | 'right' | 'top' | 'bottom';
import {
  dedupeEdges,
  renderBoundaryGroup as renderBoundaryGroupHelper,
  updateFocusedBoundary as updateFocusedBoundaryHelper,
  clearBoundaryOverlays as clearBoundaryOverlaysHelper,
} from './overlays.js';
import { startResizeSession } from './resizeSession.js';
import type { DomRenderer } from './index.js';

export class OverlayController {
  private navigator: InsertionNavigator;
  private boundryListenersAttached = false;
  private dragActive = false;
  private mode: 'insert' | 'resize' = 'insert';

  constructor(
    private readonly container: HTMLElement,
    private readonly model: DashboardModel,
    private readonly renderer: DomRenderer,
  ) {
    this.navigator = new InsertionNavigator(model);
    this.init();
  }

  private init() {
    this.container.setAttribute('tabindex', '0');
    this.attachKeyboard();
    this.attachLifecycleOverlayListeners();
    this.attachTileHoverTracker();
    this.buildOverlays();
  }

  dispose() {
    this.clearOverlays();
    // Cleanup listeners if needed, though usually container removal handles it
  }

  setMode(mode: 'insert' | 'resize') {
    this.mode = mode;
    this.container.classList.toggle('mode-insert', mode === 'insert');
    this.container.classList.toggle('mode-resize', mode === 'resize');
    this.buildOverlays();
  }

  refresh() {
    if (!this.dragActive) {
      this.buildOverlays();
    }
  }

  private attachKeyboard(): void {
    this.container.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.navigator.handleKey('Tab');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.navigator.handleKey('Enter');
      }
    });
  }

  private attachTileHoverTracker(): void {
    this.container.addEventListener('mousemove', (e: Event) => {
      const t = e.target as Element | null;
      const tileEl = t && 'closest' in t ? (t.closest('.ud-tile') as HTMLElement | null) : null;
      const id = tileEl?.dataset?.tileId;
      if (id) {
        this.navigator.pointerEnterTile(id as TileId);
      }
    });
  }

  private attachLifecycleOverlayListeners(): void {
    if (this.boundryListenersAttached) return;
    this.boundryListenersAttached = true;
    this.model.lifecycle.on('interaction:hover-start', (ctx: any) => {
      if (this.mode !== 'insert') return;
      renderBoundaryGroupHelper(this.container, ctx.group);
    });
    this.model.lifecycle.on('interaction:focus-change', (ctx: any) => {
      if (this.mode !== 'insert') return;
      updateFocusedBoundaryHelper(this.container, ctx.boundary);
    });
    this.model.lifecycle.on('interaction:hover-end', () => {
      if (this.mode !== 'insert') return;
      // Only clear boundary indicators (insertion lines), keep interaction edges
      this.clearBoundaryOverlays();
    });
    this.model.lifecycle.on('interaction:group-update', (ctx: any) => {
      if (this.mode !== 'insert') return;
      renderBoundaryGroupHelper(this.container, ctx.group);
    });
  }

  private clearOverlays(): void {
    this.clearEdgeOverlays();
    this.clearBoundaryOverlays();
  }

  private clearEdgeOverlays(): void {
    this.container.querySelectorAll('.ud-edge').forEach((n) => n.remove());
  }

  private clearBoundaryOverlays(): void {
    clearBoundaryOverlaysHelper(this.container);
  }

  private buildOverlays(): void {
    this.clearOverlays();
    const edges = this.navigator.getHoverEdges();
    const deduped = dedupeEdges(edges);

    for (const edgeData of deduped) {
      this.createEdgeOverlay(edgeData);
    }
  }

  private createEdgeOverlay(edgeData: HoverEdge) {
    const el = document.createElement('div');
    el.className = 'ud-edge';
    if (edgeData.orientation === 'vertical') el.classList.add('ud-edge-vertical');
    else el.classList.add('ud-edge-horizontal');
    el.style.position = 'absolute';
    el.style.left = `${edgeData.x}%`;
    el.style.top = `${edgeData.y}%`;
    if (edgeData.orientation === 'vertical') el.style.height = `${edgeData.height}%`;
    else el.style.width = `${edgeData.width}%`;

    if (this.mode === 'resize') {
      this.configureResizeOverlay(el, edgeData);
    } else if (this.mode === 'insert') {
      this.configureInsertOverlay(el, edgeData);
    }

    if (edgeData.seamId) {
      el.setAttribute('data-seam-id', edgeData.seamId);
    }
    this.container.appendChild(el);
  }

  private configureResizeOverlay(el: HTMLElement, edgeData: HoverEdge) {
    const rect = this.container.getBoundingClientRect();
    const isVertical = edgeData.side === 'left' || edgeData.side === 'right';
    const r = edgeData.seamId
      ? this.model.clampSeam(edgeData.seamId, 0)
      : this.model.clampResize(edgeData.tileId, { edge: edgeData.side as ResizeEdge, delta: 0 });
    const allowedPct = Math.max(0, r.max - r.min);
    const allowedPx = (isVertical ? rect.width : rect.height) * (allowedPct / 100);
    const MIN_RANGE_PX = 2;

    if (edgeData.canResize === false || allowedPx <= MIN_RANGE_PX) {
      el.classList.add('disabled');
    }

    el.addEventListener('mouseenter', () => {
      if (!el.classList.contains('disabled')) el.classList.add('active');
    });
    el.addEventListener('mouseleave', () => el.classList.remove('active'));

    el.addEventListener(
      'pointerdown',
      (eDown: PointerEvent) => {
        if (this.mode !== 'resize') return;
        if (el.classList.contains('disabled')) return;
        eDown.preventDefault();

        // Re-check clamp on interaction start to be safe
        const currentRect = this.container.getBoundingClientRect();
        const currentClamp = this.model.clampResize(edgeData.tileId, {
          edge: edgeData.side as ResizeEdge,
          delta: 0,
        });
        const currentAllowedPct = Math.max(0, currentClamp.max - currentClamp.min);
        const currentAllowedPx =
          (isVertical ? currentRect.width : currentRect.height) * (currentAllowedPct / 100);

        if (currentAllowedPx <= MIN_RANGE_PX) return;

        startResizeSession(
          {
            model: this.model,
            renderer: this.renderer,
            container: this.container,
            el,
            edge: edgeData,
            startX: eDown.clientX,
            startY: eDown.clientY,
            onSessionStart: () => {
              this.container.classList.add('dragging');
              this.dragActive = true;
            },
            onSessionEnd: () => {
              this.container.classList.remove('dragging');
              this.dragActive = false;
            },
            clearBoundaryOverlays: () => this.clearOverlays(),
            rebuildOverlays: () => this.buildOverlays(),
          },
          eDown.pointerId,
        );
      },
      { passive: false },
    );
  }

  private configureInsertOverlay(el: HTMLElement, edgeData: HoverEdge) {
    el.addEventListener('mouseenter', (evt) => {
      const rect = this.container.getBoundingClientRect();
      const xPct = (((evt as MouseEvent).clientX - rect.left) / rect.width) * 100;
      const yPct = (((evt as MouseEvent).clientY - rect.top) / rect.height) * 100;
      this.navigator.pointerEnterEdge(edgeData.id, { xPct, yPct });
    });
    el.addEventListener('mouseleave', () => {
      this.navigator.pointerLeaveEdge(edgeData.id);
    });
    el.addEventListener('mousemove', (evt) => {
      const rect = this.container.getBoundingClientRect();
      const xPct = (((evt as MouseEvent).clientX - rect.left) / rect.width) * 100;
      const yPct = (((evt as MouseEvent).clientY - rect.top) / rect.height) * 100;
      this.navigator.pointerEnterEdge(edgeData.id, { xPct, yPct });
    });
    el.addEventListener('click', async (evt) => {
      if (this.mode !== 'insert') return;
      evt.preventDefault();
      const rect = this.container.getBoundingClientRect();
      const xPct = (((evt as MouseEvent).clientX - rect.left) / rect.width) * 100;
      const yPct = (((evt as MouseEvent).clientY - rect.top) / rect.height) * 100;
      this.navigator.pointerEnterEdge(edgeData.id, { xPct, yPct });
      await this.navigator.commit();
    });
  }
}
