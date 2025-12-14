import type { DashboardModel, SnapshotV1, PartialExtendedConfig, TileId, ResizeEdge } from '@pebbledash/core';
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
  features?: {
    overlays?: boolean;
    keyboard?: boolean;
    startMode?: 'insert' | 'resize';
    /** Enable Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts (default: false) */
    keyboardUndoRedo?: boolean;
    /** Enable Delete/Backspace to delete hovered tile (default: false) */
    keyboardDelete?: boolean;
  };
  /** Registry of widget factories keyed by widget type */
  widgets?: WidgetRegistry;

  // === Tile Interaction Callbacks ===
  /** Called when a tile is clicked (not on resize edges or during drag) */
  onTileClick?: (tileId: TileId, event: MouseEvent) => void;
  /** Called when a tile is double-clicked */
  onTileDoubleClick?: (tileId: TileId, event: MouseEvent) => void;
  /** Called when pointer enters/leaves a tile */
  onTileHover?: (tileId: TileId, entering: boolean, event: MouseEvent) => void;
  /** Called when a tile receives/loses focus */
  onTileFocus?: (tileId: TileId, focused: boolean) => void;
  /** Called on right-click for custom context menus */
  onTileContextMenu?: (tileId: TileId, event: MouseEvent) => void;

  // === History Callbacks ===
  /** Called when undo/redo availability changes */
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;

  // === Mode Callbacks ===
  /** Called when interaction mode changes */
  onModeChange?: (newMode: 'insert' | 'resize', previousMode: 'insert' | 'resize') => void;

  // === Container Callbacks ===
  /** Called when container is resized */
  onContainerResize?: (width: number, height: number) => void;

  // === Resize Operation Callbacks ===
  /** Called when resize drag starts */
  onResizeStart?: (tileId: TileId, edge: ResizeEdge) => void;
  /** Called during resize with live delta (for preview UI) */
  onResizeMove?: (tileId: TileId, edge: ResizeEdge, delta: number, clamped: boolean) => void;
  /** Called when resize drag ends */
  onResizeEnd?: (tileId: TileId, edge: ResizeEdge, committed: boolean) => void;

  // === Resize Configuration ===
  resizeConfig?: {
    /** Minimum pixel range for resize to be enabled (default: 2) */
    minResizeRangePx?: number;
    /** Deadband for clamp feedback in pixels (default: 1) */
    clampDeadbandPx?: number;
    /** Minimum pixels to drag before resize starts (default: 3) */
    dragThreshold?: number;
    /** When using Shift+drag redistribute, shrink all tiles equally (default: false) */
    redistributeEqually?: boolean;
  };
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
  private containerResizeObserver?: ResizeObserver;
  private historyUnsubscribe?: () => void;

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
    // Styles are defined in styles.ts (.ud-live-region class)
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'ud-live-region';
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
      onTileClick: this.opts.onTileClick,
      onTileDoubleClick: this.opts.onTileDoubleClick,
      onTileHover: this.opts.onTileHover,
      onTileFocus: this.opts.onTileFocus,
      onTileContextMenu: this.opts.onTileContextMenu,
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

    // Set up container resize observer if callback provided
    if (this.opts.onContainerResize && typeof ResizeObserver !== 'undefined') {
      this.containerResizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this.opts.onContainerResize!(width, height);
        }
      });
      this.containerResizeObserver.observe(this.container);
    }

    // Set up history change subscription
    if (this.opts.onHistoryChange) {
      // Fire initial state
      this.opts.onHistoryChange(this.model.canUndo(), this.model.canRedo());
      
      // Subscribe to model changes to track history state
      this.historyUnsubscribe = this.model.subscribe(() => {
        this.opts.onHistoryChange!(this.model.canUndo(), this.model.canRedo());
      });
    }
  }

  unmount(): void {
    this.clearOverlays();
    if (this.unsubscribe) this.unsubscribe();
    if (this.historyUnsubscribe) this.historyUnsubscribe();
    this.containerResizeObserver?.disconnect();
    this.containerResizeObserver = undefined;
    this.renderer?.unmount?.();
    this.navigator = undefined;
    this.liveRegion?.remove();
    this.liveRegion = undefined;
  }

  /**
   * Announce a message to screen readers via the ARIA live region.
   * Consumers can use this to announce custom messages for accessibility.
   * @param message - The message to announce
   */
  announce(message: string): void {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }
  }

  getModel(): DashboardModel {
    return this.model;
  }

  setMode(mode: 'insert' | 'resize'): void {
    const previousMode = this.mode;
    this.mode = mode;
    if (this.opts.features?.overlays) {
      this.container.classList.toggle('mode-insert', mode === 'insert');
      this.container.classList.toggle('mode-resize', mode === 'resize');
      this.buildOverlays();
    }
    // Fire mode change callback if mode actually changed
    if (previousMode !== mode && this.opts.onModeChange) {
      this.opts.onModeChange(mode, previousMode);
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
      this.configPreviewOverlay = new ConfigPreviewOverlay(this.container, this.model, {}, 'ud');
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
      // Handle undo/redo shortcuts if enabled
      if (this.opts.features?.keyboardUndoRedo) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
        
        if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          this.model.undo();
          return;
        }
        if (cmdOrCtrl && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          this.model.redo();
          return;
        }
        // Also support Ctrl+Y for redo on Windows
        if (!isMac && e.ctrlKey && e.key === 'y') {
          e.preventDefault();
          this.model.redo();
          return;
        }
      }

      // Handle Delete/Backspace for tile deletion if enabled
      if (this.opts.features?.keyboardDelete && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Get the focused tile from the navigator or from last hovered tile
        const focusedTileId = this.navigator?.getFocusedTile?.() ?? this.lastHoveredTileId;
        if (focusedTileId) {
          e.preventDefault();
          // Don't delete if only one tile remains
          if (this.model.getState().tiles.size > 1) {
            void this.model.deleteTile(focusedTileId);
          }
          return;
        }
      }

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
  
  /** Track last hovered tile for keyboard operations */
  private lastHoveredTileId: TileId | null = null;

  private attachTileHoverTracker(): void {
    // Track the tile the pointer is coming from to improve boundary selection heuristics
    // and to enable keyboard operations on the hovered tile
    this.container.addEventListener('mousemove', (e: Event) => {
      const t = e.target as Element | null;
      const tileEl = t && 'closest' in t ? (t.closest('.ud-tile') as HTMLElement | null) : null;
      const id = tileEl?.dataset?.tileId;
      if (id) {
        this.lastHoveredTileId = id as TileId;
        if (this.navigator) {
          this.navigator.pointerEnterTile(id as TileId);
        }
      }
    });
    
    // Clear hover when leaving the container
    this.container.addEventListener('mouseleave', () => {
      this.lastHoveredTileId = null;
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
      // Determine disabled state in resize mode: not resizable, too-small range, or locked
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
        const MIN_RANGE_PX = this.opts.resizeConfig?.minResizeRangePx ?? 2;
        
        // Check if edge is locked via tile constraints
        const configManager = this.model.getConfigManager();
        const constraints = configManager.getTileConstraints(edgeData.tileId);
        const isLocked = constraints?.lockedZones?.includes(edgeData.side as 'top' | 'bottom' | 'left' | 'right');
        
        if (edgeData.canResize === false || allowedPx <= MIN_RANGE_PX || isLocked) {
          el.classList.add('disabled');
        }
        if (isLocked) {
          el.classList.add('locked');
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
          await this.navigator!.pointerEnterEdge(edgeData.id, { xPct, yPct });
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
          
            // Check if this edge is locked via tile constraints
            const configManager = this.model.getConfigManager();
            const constraints = configManager.getTileConstraints(edgeData.tileId);
            if (constraints?.lockedZones?.includes(edgeData.side as 'top' | 'bottom' | 'left' | 'right')) {
              return; // Edge is locked, don't allow resize
            }
          
          eDown.preventDefault();
          const rect = this.container.getBoundingClientRect();
          const isVertical = edgeData.side === 'left' || edgeData.side === 'right';
          const minRangePx = this.opts.resizeConfig?.minResizeRangePx ?? 2;
          const clampInfo = this.model.clampResize(edgeData.tileId, {
            edge: edgeData.side as ResizeEdge,
            delta: 0,
          });
          const allowedPct = Math.max(0, clampInfo.max - clampInfo.min);
          const allowedPx = (isVertical ? rect.width : rect.height) * (allowedPct / 100);
          if (allowedPx <= minRangePx) return;
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
                this.renderer.setDragActive(true);
                // Fire resize start callback
                this.opts.onResizeStart?.(edgeData.tileId, edgeData.side as ResizeEdge);
              },
              onSessionEnd: (committed?: boolean) => {
                this.container.classList.remove('dragging');
                this.dragActive = false;
                this.renderer.setDragActive(false);
                // Fire resize end callback
                this.opts.onResizeEnd?.(edgeData.tileId, edgeData.side as ResizeEdge, committed ?? false);
              },
              onResizeMove: (delta: number, clamped: boolean) => {
                // Fire resize move callback
                this.opts.onResizeMove?.(edgeData.tileId, edgeData.side as ResizeEdge, delta, clamped);
              },
              clearBoundaryOverlays: () => this.clearBoundaryOverlays(),
              rebuildOverlays: () => this.buildOverlays(),
              resizeConfig: this.opts.resizeConfig,
              redistributeConfig: {
                enabled: true,
                minWidth: this.opts.defaults?.minTile?.width ?? 10,
                minHeight: this.opts.defaults?.minTile?.height ?? 10,
                redistributeEqually: this.opts.resizeConfig?.redistributeEqually ?? false,
              },
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
