import type { DashboardModel, SnapshotV1, PartialExtendedConfig, TileId } from '@pebbledash/core';
import { InsertionNavigator } from '@pebbledash/core/internal';
import {
  dedupeEdges,
  renderBoundaryGroup as renderBoundaryGroupHelper,
  updateFocusedBoundary as updateFocusedBoundaryHelper,
  clearBoundaryOverlays as clearBoundaryOverlaysHelper,
} from './overlays.js';
import { startResizeSession } from './resizeSession.js';
import { ConfigPreviewOverlay } from './ConfigPreviewOverlay.js';
import type { WidgetRegistry } from './widgets.js';
import type { DomRenderer } from './index.js';

type ResizeEdge = 'left' | 'right' | 'top' | 'bottom';

export interface BaseDashboardOptions {
  container: HTMLElement | string;
  defaults?: {
    minTile?: { width: number; height: number };
    maxTiles?: number;
    epsilon?: number;
  };
  initialLayout?:
    | SnapshotV1
    | {
        tiles: Array<{
          id: TileId | string;
          x: number;
          y: number;
          width: number;
          height: number;
          locked?: boolean;
          meta?: Record<string, unknown>;
        }>;
      };
  features?: { overlays?: boolean; keyboard?: boolean; startMode?: 'insert' | 'resize' };
  /** Registry of widget factories keyed by widget type */
  widgets?: WidgetRegistry;
}

export class BaseDashboard {
  private container!: HTMLElement;
  private model!: DashboardModel;
  private navigator?: InsertionNavigator;
  private renderer!: DomRenderer;
  private mode: 'insert' | 'resize';
  private unsubscribe?: () => void;
  private opts: BaseDashboardOptions;
  private boundryListenersAttached = false;
  private dragActive = false;
  private liveRegion?: HTMLElement;
  private configPreviewOverlay?: ConfigPreviewOverlay;

  constructor(opts: BaseDashboardOptions) {
    this.opts = opts;
    this.mode = opts.features?.startMode ?? 'insert';
  }

  async mount(): Promise<void> {
    this.container =
      typeof this.opts.container === 'string'
        ? (document.querySelector(this.opts.container) as HTMLElement)
        : this.opts.container;
    if (!this.container) throw new Error('BaseDashboard: container not found');
    // Create ARIA live region for accessibility announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'ud-live-region';
    // Visually hidden but accessible to screen readers
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.padding = '0';
    this.liveRegion.style.margin = '-1px';
    this.liveRegion.style.overflow = 'hidden';
    this.liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    this.liveRegion.style.whiteSpace = 'nowrap';
    this.liveRegion.style.border = '0';
    this.container.appendChild(this.liveRegion);
    // Create model with provided defaults
    const { DashboardModel: CoreModel } = await import('@pebbledash/core');
    this.model = new CoreModel(this.opts.defaults);
    const initialLayout = this.opts.initialLayout as
      | SnapshotV1
      | { tiles: Array<unknown> }
      | undefined;
    if (initialLayout && 'version' in initialLayout && initialLayout.version === 1) {
      await this.model.initialize({
        layout: { tiles: (initialLayout as SnapshotV1).tiles },
      });
    } else if (initialLayout && 'tiles' in initialLayout) {
      // Cast to expected type for non-snapshot layouts
      await this.model.initialize({
        layout: { tiles: initialLayout.tiles as SnapshotV1['tiles'] },
      });
    } else {
      await this.model.initialize();
    }
    // Render
    const { DomRenderer } = await import('./index.js');
    this.renderer = new DomRenderer({
      container: this.container,
      widgets: this.opts.widgets,
    });
    this.renderer.mount(this.model);
    // Subscribe to model changes to refresh
    this.unsubscribe = this.model.subscribe(() => {
      this.renderer.render?.();
      if (this.opts.features?.overlays && !this.dragActive) {
        this.buildOverlays();
      }
    });
    // Optional overlays and keyboard
    if (this.opts.features?.overlays) {
      this.navigator = new InsertionNavigator(this.model);
      this.container.setAttribute('tabindex', '0');
      this.container.classList.toggle('mode-insert', this.mode === 'insert');
      this.container.classList.toggle('mode-resize', this.mode === 'resize');
      this.attachKeyboard();
      this.attachLifecycleOverlayListeners();
      this.attachTileHoverTracker();
      this.buildOverlays();
    }
  }

  unmount(): void {
    this.clearOverlays();
    if (this.unsubscribe) this.unsubscribe();
    this.renderer?.unmount?.();
    this.navigator = undefined;
    this.liveRegion?.remove();
    this.liveRegion = undefined;
  }

  /**
   * Announce a message to screen readers via the ARIA live region
   */
  private announce(message: string): void {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }
  }

  getModel(): DashboardModel {
    return this.model;
  }

  setMode(mode: 'insert' | 'resize'): void {
    this.mode = mode;
    if (this.opts.features?.overlays) {
      this.container.classList.toggle('mode-insert', mode === 'insert');
      this.container.classList.toggle('mode-resize', mode === 'resize');
      this.buildOverlays();
    }
  }

  // === Config Preview API ===

  /**
   * Start a configuration preview with proposed changes.
   * Shows a ghost overlay indicating which tiles would be affected
   * and visualizes constraint boundaries.
   *
   * @param config - Proposed configuration changes
   */
  startConfigPreview(config: PartialExtendedConfig): void {
    if (!this.configPreviewOverlay) {
      this.configPreviewOverlay = new ConfigPreviewOverlay(this.container, this.model);
    }
    this.configPreviewOverlay.startPreview(config);
    this.container.classList.add('config-preview-active');
  }

  /**
   * End the configuration preview and remove overlays.
   */
  endConfigPreview(): void {
    if (this.configPreviewOverlay) {
      this.configPreviewOverlay.endPreview();
      this.container.classList.remove('config-preview-active');
    }
  }

  /**
   * Check if config preview is currently active.
   */
  isConfigPreviewActive(): boolean {
    return this.configPreviewOverlay?.isPreviewActive() ?? false;
  }

  /**
   * Get tiles that would be affected by the current preview config.
   */
  getPreviewAffectedTiles(): TileId[] {
    return this.configPreviewOverlay?.getAffectedTiles() ?? [];
  }

  /**
   * Update the preview with new proposed config.
   */
  updateConfigPreview(config: PartialExtendedConfig): void {
    if (this.configPreviewOverlay?.isPreviewActive()) {
      this.configPreviewOverlay.updatePreview(config);
    }
  }

  async updateDefaults(partial: BaseDashboardOptions['defaults']): Promise<void> {
    const snapshot = this.model.createSnapshot();
    const current = this.opts.defaults ?? {};
    this.opts.defaults = { ...current, ...(partial || {}) };
    // Recreate model with merged defaults and restore snapshot
    const { DashboardModel: CoreModel } = await import('@pebbledash/core');
    const next = new CoreModel(this.opts.defaults);
    await next.initialize();
    next.restoreSnapshot(snapshot);
    // Swap models
    if (this.unsubscribe) this.unsubscribe();
    this.model = next;
    this.renderer?.mount?.(this.model);
    this.unsubscribe = this.model.subscribe(() => {
      this.renderer.render?.();
      if (this.opts.features?.overlays) {
        this.buildOverlays();
      }
    });
    if (this.opts.features?.overlays && !this.navigator) {
      this.navigator = new InsertionNavigator(this.model);
    }
    this.buildOverlays();
  }

  private attachKeyboard(): void {
    if (!this.opts.features?.keyboard) return;
    this.container.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!this.navigator) return;
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
    // Track the tile the pointer is coming from to improve boundary selection heuristics
    this.container.addEventListener('mousemove', (e: Event) => {
      const t = e.target as Element | null;
      const tileEl = t && 'closest' in t ? (t.closest('.ud-tile') as HTMLElement | null) : null;
      const id = tileEl?.dataset?.tileId;
      if (id && this.navigator) {
        this.navigator.pointerEnterTile(id as TileId);
      }
    });
  }

  private attachLifecycleOverlayListeners(): void {
    if (this.boundryListenersAttached) return;
    this.boundryListenersAttached = true;
    this.model.lifecycle.on('interaction:hover-start', (ctx) => {
      const { group } = ctx as { group: any };
      if (this.mode !== 'insert') return;
      this.renderBoundaryGroup(group);
    });
    this.model.lifecycle.on('interaction:focus-change', (ctx) => {
      const { boundary } = ctx as { boundary: any };
      if (this.mode !== 'insert') return;
      this.updateFocusedBoundary(boundary);
    });
    this.model.lifecycle.on('interaction:hover-end', () => {
      if (this.mode !== 'insert') return;
      this.clearBoundaryOverlays();
    });
    this.model.lifecycle.on('interaction:group-update', (ctx) => {
      const { group } = ctx as { group: any };
      if (this.mode !== 'insert') return;
      this.renderBoundaryGroup(group);
    });
    // Ensure dashboard re-renders after keyboard commit (Tab + Enter)
    this.model.lifecycle.on('interaction:committed', () => {
      this.renderer.render?.();
      if (this.opts.features?.overlays && !this.dragActive) {
        this.buildOverlays();
      }
    });
  }

  private buildOverlays(): void {
    if (!this.navigator) return;
    this.clearOverlays();
    const edges = this.navigator.getHoverEdges();
    // Deduplicate seam segments similar to demo
    const deduped = dedupeEdges(edges);
    for (const edgeData of deduped) {
      const el = document.createElement('div');
      el.className = 'ud-edge';
      if (edgeData.orientation === 'vertical') el.classList.add('ud-edge-vertical');
      else el.classList.add('ud-edge-horizontal');
      el.style.position = 'absolute';
      el.style.left = `${edgeData.x}%`;
      el.style.top = `${edgeData.y}%`;
      if (edgeData.orientation === 'vertical') el.style.height = `${edgeData.height}%`;
      else el.style.width = `${edgeData.width}%`;
      // Determine disabled state in resize mode: not resizable or too-small range
      if (this.mode === 'resize') {
        const rect = this.container.getBoundingClientRect();
        const isVertical = edgeData.side === 'left' || edgeData.side === 'right';
        const seamId = edgeData.seamId;
        const r = seamId
          ? this.model.clampSeam(seamId, 0)
          : this.model.clampResize(edgeData.tileId, {
              edge: edgeData.side as ResizeEdge,
              delta: 0,
            });
        const allowedPct = Math.max(0, r.max - r.min);
        const allowedPx = (isVertical ? rect.width : rect.height) * (allowedPct / 100);
        const MIN_RANGE_PX = 2;
        if (edgeData.canResize === false || allowedPx <= MIN_RANGE_PX) {
          el.classList.add('disabled');
        }
      }
      if (edgeData.seamId) {
        el.setAttribute('data-seam-id', edgeData.seamId);
      }
      // Hover/focus events only in insert mode to avoid churn during resize
      if (this.mode === 'insert') {
        el.addEventListener('mouseenter', (evt) => {
          const rect = this.container.getBoundingClientRect();
          const xPct = (((evt as MouseEvent).clientX - rect.left) / rect.width) * 100;
          const yPct = (((evt as MouseEvent).clientY - rect.top) / rect.height) * 100;
          this.navigator!.pointerEnterEdge(edgeData.id, { xPct, yPct });
        });
        el.addEventListener('mouseleave', () => {
          this.navigator!.pointerLeaveEdge(edgeData.id);
        });
        // Keep boundary focus in sync while hovering
        el.addEventListener('mousemove', (evt) => {
          const rect = this.container.getBoundingClientRect();
          const xPct = (((evt as MouseEvent).clientX - rect.left) / rect.width) * 100;
          const yPct = (((evt as MouseEvent).clientY - rect.top) / rect.height) * 100;
          this.navigator!.pointerEnterEdge(edgeData.id, { xPct, yPct });
        });
        // Click to insert in insert mode
        el.addEventListener('click', async (evt) => {
          if (this.mode !== 'insert') return;
          evt.preventDefault();
          const rect = this.container.getBoundingClientRect();
          const xPct = (((evt as MouseEvent).clientX - rect.left) / rect.width) * 100;
          const yPct = (((evt as MouseEvent).clientY - rect.top) / rect.height) * 100;
          this.navigator!.pointerEnterEdge(edgeData.id, { xPct, yPct });
          await this.navigator!.commit();
        });
      } else if (this.mode === 'resize') {
        el.addEventListener('mouseenter', () => {
          if (!el.classList.contains('disabled')) el.classList.add('active');
        });
        el.addEventListener('mouseleave', () => el.classList.remove('active'));
      }
      // Pointer-based resize in resize mode
      el.addEventListener(
        'pointerdown',
        (eDown: PointerEvent) => {
          if (this.mode !== 'resize') return;
          if ((el as HTMLElement).classList.contains('disabled')) return;
          eDown.preventDefault();
          const rect = this.container.getBoundingClientRect();
          const isVertical = edgeData.side === 'left' || edgeData.side === 'right';
          const MIN_RANGE_PX = 2;
          const clampInfo = this.model.clampResize(edgeData.tileId, {
            edge: edgeData.side as ResizeEdge,
            delta: 0,
          });
          const allowedPct = Math.max(0, clampInfo.max - clampInfo.min);
          const allowedPx = (isVertical ? rect.width : rect.height) * (allowedPct / 100);
          if (allowedPx <= MIN_RANGE_PX) return;
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
              clearBoundaryOverlays: () => this.clearBoundaryOverlays(),
              rebuildOverlays: () => this.buildOverlays(),
            },
            eDown.pointerId,
          );
        },
        { passive: false },
      );
      this.container.appendChild(el);
    }
  }

  private clearOverlays(): void {
    this.container.querySelectorAll('.ud-edge').forEach((n) => n.remove());
    this.clearBoundaryOverlays();
  }

  private clearBoundaryOverlays(): void {
    clearBoundaryOverlaysHelper(this.container);
  }

  private renderBoundaryGroup(group: any): void {
    renderBoundaryGroupHelper(this.container, group);
  }

  private updateFocusedBoundary(boundary: any): void {
    updateFocusedBoundaryHelper(this.container, boundary);
  }
}
