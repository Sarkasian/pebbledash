import type { 
  DashboardModel, 
  TileId, 
  ResizeEdge, 
  SnapshotV1,
  PartialExtendedConfig,
  Tile,
} from '@pebbledash/core';
import type { 
  BaseDashboard as BaseDashboardType,
  WidgetRegistry,
} from '@pebbledash/renderer-dom';

/**
 * Type for initial layout configuration.
 */
export type InitialLayout = 
  | SnapshotV1 
  | { tiles: Array<{ id: string; x: number; y: number; width: number; height: number; locked?: boolean; meta?: Record<string, unknown> }> };

/**
 * Configuration options for the ud-dashboard element.
 */
export interface UDDashboardConfig {
  /** Minimum tile dimensions as percentages */
  minTile?: { width: number; height: number };
  /** Maximum number of tiles allowed */
  maxTiles?: number;
  /** Epsilon for floating point comparisons */
  epsilon?: number;
  /** Enable edge overlays for insert/resize */
  overlays?: boolean;
  /** Enable keyboard navigation */
  keyboard?: boolean;
  /** Initial mode */
  startMode?: 'insert' | 'resize';
  /** Enable keyboard undo/redo */
  keyboardUndoRedo?: boolean;
  /** Enable keyboard delete */
  keyboardDelete?: boolean;
  /** Resize configuration */
  resizeConfig?: {
    minResizeRangePx?: number;
    clampDeadbandPx?: number;
    dragThreshold?: number;
    redistributeEqually?: boolean;
  };
}

/**
 * Event detail for tile events.
 */
export interface TileEventDetail {
  tileId: TileId;
  originalEvent?: Event;
}

/**
 * Event detail for tile hover events.
 */
export interface TileHoverEventDetail extends TileEventDetail {
  entering: boolean;
}

/**
 * Event detail for tile focus events.
 */
export interface TileFocusEventDetail extends TileEventDetail {
  focused: boolean;
}

/**
 * Event detail for history change events.
 */
export interface HistoryChangeEventDetail {
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Event detail for mode change events.
 */
export interface ModeChangeEventDetail {
  mode: 'insert' | 'resize';
  previousMode: 'insert' | 'resize';
}

/**
 * Event detail for container resize events.
 */
export interface ContainerResizeEventDetail {
  width: number;
  height: number;
}

/**
 * Event detail for resize operation events.
 */
export interface ResizeOperationEventDetail {
  tileId: TileId;
  edge: ResizeEdge;
  delta?: number;
  clamped?: boolean;
  committed?: boolean;
}

/**
 * Event detail for tiles change events.
 */
export interface TilesChangeEventDetail {
  tiles: Tile[];
}

/**
 * Custom event types emitted by ud-dashboard.
 */
export interface UDDashboardEventMap {
  'ud-tile-click': CustomEvent<TileEventDetail>;
  'ud-tile-dblclick': CustomEvent<TileEventDetail>;
  'ud-tile-hover': CustomEvent<TileHoverEventDetail>;
  'ud-tile-focus': CustomEvent<TileFocusEventDetail>;
  'ud-tile-contextmenu': CustomEvent<TileEventDetail>;
  'ud-history-change': CustomEvent<HistoryChangeEventDetail>;
  'ud-mode-change': CustomEvent<ModeChangeEventDetail>;
  'ud-container-resize': CustomEvent<ContainerResizeEventDetail>;
  'ud-resize-start': CustomEvent<ResizeOperationEventDetail>;
  'ud-resize-move': CustomEvent<ResizeOperationEventDetail>;
  'ud-resize-end': CustomEvent<ResizeOperationEventDetail>;
  'ud-tiles-change': CustomEvent<TilesChangeEventDetail>;
  'ud-ready': CustomEvent<{ dashboard: UDDashboard }>;
}

/**
 * Observed attributes for ud-dashboard.
 */
const OBSERVED_ATTRIBUTES = [
  'mode',
  'min-tile-width',
  'min-tile-height',
  'max-tiles',
  'overlays',
  'keyboard',
  'keyboard-undo-redo',
  'keyboard-delete',
  'use-shadow-dom',
] as const;

type ObservedAttribute = typeof OBSERVED_ATTRIBUTES[number];

/**
 * A custom element for rendering pebbledash dashboards.
 * 
 * @example
 * ```html
 * <ud-dashboard
 *   mode="resize"
 *   min-tile-width="10"
 *   min-tile-height="10"
 *   overlays
 *   keyboard
 * ></ud-dashboard>
 * 
 * <script>
 *   const dashboard = document.querySelector('ud-dashboard');
 *   dashboard.widgets = { default: createDefaultWidget };
 *   dashboard.initialLayout = {
 *     tiles: [
 *       { id: 'tile-1', x: 0, y: 0, width: 50, height: 100 },
 *       { id: 'tile-2', x: 50, y: 0, width: 50, height: 100 },
 *     ]
 *   };
 *   
 *   dashboard.addEventListener('ud-tile-click', (e) => {
 *     console.log('Clicked tile:', e.detail.tileId);
 *   });
 * </script>
 * ```
 * 
 * @fires ud-tile-click - Fired when a tile is clicked
 * @fires ud-tile-dblclick - Fired when a tile is double-clicked
 * @fires ud-tile-hover - Fired when pointer enters/leaves a tile
 * @fires ud-tile-focus - Fired when a tile receives/loses focus
 * @fires ud-tile-contextmenu - Fired on right-click
 * @fires ud-history-change - Fired when undo/redo availability changes
 * @fires ud-mode-change - Fired when interaction mode changes
 * @fires ud-container-resize - Fired when container is resized
 * @fires ud-resize-start - Fired when resize drag starts
 * @fires ud-resize-move - Fired during resize with live delta
 * @fires ud-resize-end - Fired when resize drag ends
 * @fires ud-tiles-change - Fired when tiles change
 * @fires ud-ready - Fired when dashboard is ready
 */
export class UDDashboard extends HTMLElement {
  static observedAttributes = OBSERVED_ATTRIBUTES;

  #dashboard?: BaseDashboardType;
  #model?: DashboardModel;
  #widgets?: WidgetRegistry;
  #initialLayout?: InitialLayout;
  #config: UDDashboardConfig = {};
  #unsubscribe?: () => void;
  #shadowRoot?: ShadowRoot;
  #container?: HTMLElement;
  #mounted = false;

  // === Property Accessors ===

  /** The underlying DashboardModel instance */
  get model(): DashboardModel | undefined {
    return this.#model;
  }

  /** Widget registry for rendering tile content */
  set widgets(w: WidgetRegistry | undefined) {
    this.#widgets = w;
    if (this.#mounted && this.isConnected) {
      this.#remount();
    }
  }
  get widgets(): WidgetRegistry | undefined {
    return this.#widgets;
  }

  /** Initial layout for the dashboard */
  set initialLayout(layout: InitialLayout | undefined) {
    this.#initialLayout = layout;
    if (this.#mounted && this.isConnected) {
      this.#remount();
    }
  }
  get initialLayout(): InitialLayout | undefined {
    return this.#initialLayout;
  }

  /** Configuration options */
  set config(c: UDDashboardConfig) {
    this.#config = { ...this.#config, ...c };
    if (this.#mounted && this.isConnected) {
      this.#remount();
    }
  }
  get config(): UDDashboardConfig {
    return { ...this.#config };
  }

  /** Current interaction mode */
  get mode(): 'insert' | 'resize' {
    return this.getAttribute('mode') as 'insert' | 'resize' || this.#config.startMode || 'insert';
  }
  set mode(m: 'insert' | 'resize') {
    this.setAttribute('mode', m);
    this.#dashboard?.setMode(m);
  }

  // === Lifecycle ===

  constructor() {
    super();
  }

  connectedCallback(): void {
    this.style.display = 'block';
    this.style.width = this.style.width || '100%';
    this.style.height = this.style.height || '100%';

    // Use shadow DOM if attribute is set
    if (this.hasAttribute('use-shadow-dom')) {
      this.#shadowRoot = this.attachShadow({ mode: 'open' });
      this.#container = document.createElement('div');
      this.#container.style.width = '100%';
      this.#container.style.height = '100%';
      this.#shadowRoot.appendChild(this.#container);
    } else {
      this.#container = this;
    }

    this.#mount();
  }

  disconnectedCallback(): void {
    this.#unmount();
  }

  attributeChangedCallback(name: ObservedAttribute, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'mode':
        if (newValue === 'insert' || newValue === 'resize') {
          this.#dashboard?.setMode(newValue);
        }
        break;
      case 'min-tile-width':
        this.#config.minTile = { 
          ...this.#config.minTile, 
          width: parseFloat(newValue || '10') 
        } as { width: number; height: number };
        break;
      case 'min-tile-height':
        this.#config.minTile = { 
          ...this.#config.minTile, 
          height: parseFloat(newValue || '10') 
        } as { width: number; height: number };
        break;
      case 'max-tiles':
        this.#config.maxTiles = newValue ? parseInt(newValue, 10) : undefined;
        break;
      case 'overlays':
        this.#config.overlays = newValue !== null;
        break;
      case 'keyboard':
        this.#config.keyboard = newValue !== null;
        break;
      case 'keyboard-undo-redo':
        this.#config.keyboardUndoRedo = newValue !== null;
        break;
      case 'keyboard-delete':
        this.#config.keyboardDelete = newValue !== null;
        break;
    }
  }

  // === Public Methods ===

  /** Undo the last operation */
  undo(): void {
    this.#model?.undo();
  }

  /** Redo the last undone operation */
  redo(): void {
    this.#model?.redo();
  }

  /** Check if undo is available */
  canUndo(): boolean {
    return this.#model?.canUndo() ?? false;
  }

  /** Check if redo is available */
  canRedo(): boolean {
    return this.#model?.canRedo() ?? false;
  }

  /** Announce a message for screen readers */
  announce(message: string): void {
    this.#dashboard?.announce(message);
  }

  /** Start config preview mode */
  startConfigPreview(config: PartialExtendedConfig): void {
    this.#dashboard?.startConfigPreview(config);
  }

  /** End config preview mode */
  endConfigPreview(): void {
    this.#dashboard?.endConfigPreview();
  }

  /** Check if config preview is active */
  isConfigPreviewActive(): boolean {
    return this.#dashboard?.isConfigPreviewActive() ?? false;
  }

  /** Get tiles affected by current preview */
  getPreviewAffectedTiles(): TileId[] {
    return this.#dashboard?.getPreviewAffectedTiles() ?? [];
  }

  /** Get all tiles */
  getTiles(): Tile[] {
    return this.#model?.getState().toArray() ?? [];
  }

  /** Split a tile */
  async splitTile(
    tileId: TileId, 
    options: { orientation: 'horizontal' | 'vertical'; ratio?: number }
  ): Promise<TileId | null> {
    if (!this.#model) return null;
    const result = await this.#model.splitTile(tileId, options);
    return result.newTileId ?? null;
  }

  /** Delete a tile */
  async deleteTile(tileId: TileId): Promise<boolean> {
    if (!this.#model) return false;
    const result = await this.#model.deleteTile(tileId);
    return result.valid;
  }

  // === Private Methods ===

  async #mount(): Promise<void> {
    if (!this.#container) return;

    const { BaseDashboard } = await import('@pebbledash/renderer-dom');

    // Parse attributes for initial config
    const overlays = this.hasAttribute('overlays') ? true : (this.#config.overlays ?? true);
    const keyboard = this.hasAttribute('keyboard') ? true : (this.#config.keyboard ?? true);
    const keyboardUndoRedo = this.hasAttribute('keyboard-undo-redo') ? true : this.#config.keyboardUndoRedo;
    const keyboardDelete = this.hasAttribute('keyboard-delete') ? true : this.#config.keyboardDelete;
    const startMode = (this.getAttribute('mode') as 'insert' | 'resize') || this.#config.startMode || 'insert';

    const minTileWidth = this.getAttribute('min-tile-width');
    const minTileHeight = this.getAttribute('min-tile-height');
    const maxTiles = this.getAttribute('max-tiles');

    const defaults = {
      minTile: {
        width: minTileWidth ? parseFloat(minTileWidth) : (this.#config.minTile?.width ?? 10),
        height: minTileHeight ? parseFloat(minTileHeight) : (this.#config.minTile?.height ?? 10),
      },
      maxTiles: maxTiles ? parseInt(maxTiles, 10) : this.#config.maxTiles,
      epsilon: this.#config.epsilon,
    };

    this.#dashboard = new BaseDashboard({
      container: this.#container,
      defaults,
      initialLayout: this.#initialLayout,
      features: {
        overlays,
        keyboard,
        startMode,
        keyboardUndoRedo,
        keyboardDelete,
      },
      resizeConfig: this.#config.resizeConfig,
      widgets: this.#widgets,
      onTileClick: (tileId, event) => {
        this.#emit('ud-tile-click', { tileId, originalEvent: event });
      },
      onTileDoubleClick: (tileId, event) => {
        this.#emit('ud-tile-dblclick', { tileId, originalEvent: event });
      },
      onTileHover: (tileId, entering, event) => {
        this.#emit('ud-tile-hover', { tileId, entering, originalEvent: event });
      },
      onTileFocus: (tileId, focused) => {
        this.#emit('ud-tile-focus', { tileId, focused });
      },
      onTileContextMenu: (tileId, event) => {
        this.#emit('ud-tile-contextmenu', { tileId, originalEvent: event });
      },
      onHistoryChange: (canUndo, canRedo) => {
        this.#emit('ud-history-change', { canUndo, canRedo });
      },
      onModeChange: (mode, previousMode) => {
        this.setAttribute('mode', mode);
        this.#emit('ud-mode-change', { mode, previousMode });
      },
      onContainerResize: (width, height) => {
        this.#emit('ud-container-resize', { width, height });
      },
      onResizeStart: (tileId, edge) => {
        this.#emit('ud-resize-start', { tileId, edge });
      },
      onResizeMove: (tileId, edge, delta, clamped) => {
        this.#emit('ud-resize-move', { tileId, edge, delta, clamped });
      },
      onResizeEnd: (tileId, edge, committed) => {
        this.#emit('ud-resize-end', { tileId, edge, committed });
      },
    });

    await this.#dashboard.mount();
    this.#model = this.#dashboard.getModel();
    this.#mounted = true;

    // Subscribe to model changes
    this.#unsubscribe = this.#model.subscribe(() => {
      const tiles = this.#model!.getState().toArray();
      this.#emit('ud-tiles-change', { tiles });
    });

    // Emit ready event
    this.#emit('ud-ready', { dashboard: this });
  }

  #unmount(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
    this.#dashboard?.unmount();
    this.#dashboard = undefined;
    this.#model = undefined;
    this.#mounted = false;
  }

  #remount(): void {
    this.#unmount();
    if (this.#container) {
      this.#container.innerHTML = '';
    }
    this.#mount();
  }

  #emit<K extends keyof UDDashboardEventMap>(
    type: K, 
    detail: UDDashboardEventMap[K]['detail']
  ): void {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true, // Cross shadow DOM boundary
      detail,
    }));
  }
}

// Register the custom element
if (typeof customElements !== 'undefined' && !customElements.get('ud-dashboard')) {
  customElements.define('ud-dashboard', UDDashboard);
}

// Re-export types for convenience
export type {
  Widget,
  WidgetFactory,
  WidgetRegistry,
  WidgetContext,
} from '@pebbledash/renderer-dom';

export type {
  TileId,
  Tile,
  ResizeEdge,
  SnapshotV1,
  PartialExtendedConfig,
  DashboardModel,
} from '@pebbledash/core';
