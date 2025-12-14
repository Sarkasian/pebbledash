import type { DashboardModel, TileId } from '@pebbledash/core';
import type { Widget, WidgetRegistry, WidgetContext, OverlayPosition } from './widgets.js';
import { getBaseStyles } from './styles.js';

export interface DomRendererOptions {
  container: HTMLElement;
  classNameRoot?: string;
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

  /** Hover debounce time in ms (default: 50) */
  hoverDebounceMs?: number;
}

/** Check if user prefers reduced motion */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class DomRenderer {
  private model?: DashboardModel;
  private readonly container: HTMLElement;
  private readonly rootClass: string;
  private readonly tileEls: Map<string, HTMLElement>;
  private readonly lastRects: Map<string, { w: number; h: number; l: number; t: number }>;
  private readonly widgetRegistry: WidgetRegistry;
  private readonly mountedWidgets: Map<string, Widget>;
  private readonly resizeCallbacks: Map<string, Set<() => void>>;
  private readonly clickCallbacks: Map<string, Set<(event: MouseEvent) => void>>;
  private readonly hoverCallbacks: Map<string, Set<(entering: boolean) => void>>;
  private resizeObserver?: ResizeObserver;
  private reducedMotionQuery?: MediaQueryList;

  // Tile interaction callbacks
  private readonly onTileClick?: (tileId: TileId, event: MouseEvent) => void;
  private readonly onTileDoubleClick?: (tileId: TileId, event: MouseEvent) => void;
  private readonly onTileHover?: (tileId: TileId, entering: boolean, event: MouseEvent) => void;
  private readonly onTileFocus?: (tileId: TileId, focused: boolean) => void;
  private readonly onTileContextMenu?: (tileId: TileId, event: MouseEvent) => void;
  private readonly hoverDebounceMs: number;

  // Hover debounce state per tile
  private readonly hoverTimers: Map<string, ReturnType<typeof setTimeout>>;
  private readonly hoverStates: Map<string, boolean>;

  // Drag state tracking (set by external code via setDragActive)
  private dragActive = false;

  constructor(opts: DomRendererOptions) {
    this.container = opts.container;
    this.rootClass = opts.classNameRoot ?? 'ud';
    this.container.classList.add(`${this.rootClass}-root`);
    this.container.style.position = 'relative';
    this.tileEls = new Map<string, HTMLElement>();
    this.lastRects = new Map();
    this.widgetRegistry = opts.widgets ?? {};
    this.mountedWidgets = new Map();
    this.resizeCallbacks = new Map();
    this.clickCallbacks = new Map();
    this.hoverCallbacks = new Map();
    this.hoverTimers = new Map();
    this.hoverStates = new Map();

    // Store tile interaction callbacks
    this.onTileClick = opts.onTileClick;
    this.onTileDoubleClick = opts.onTileDoubleClick;
    this.onTileHover = opts.onTileHover;
    this.onTileFocus = opts.onTileFocus;
    this.onTileContextMenu = opts.onTileContextMenu;
    this.hoverDebounceMs = opts.hoverDebounceMs ?? 50;

    // Set up reduced motion support
    this.setupReducedMotion();

    // Inject accessibility focus styles
    this.injectFocusStyles();

    // Observe container resize and notify tiles so embedded content can reflow
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        // Notify all tiles on container resize
        this.notifyAllTileResize();
      });
      this.resizeObserver.observe(this.container);
    }
  }

  /** Set drag active state (called by BaseDashboard during resize operations) */
  setDragActive(active: boolean): void {
    this.dragActive = active;
  }

  /** Check if drag is currently active */
  isDragActive(): boolean {
    return this.dragActive;
  }

  /** Set up reduced motion preference support */
  private setupReducedMotion(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Apply initial state
    this.applyReducedMotion(this.reducedMotionQuery.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => this.applyReducedMotion(e.matches);
    if (this.reducedMotionQuery.addEventListener) {
      this.reducedMotionQuery.addEventListener('change', handler);
    }
  }

  /** Apply or remove reduced motion class */
  private applyReducedMotion(reduced: boolean): void {
    this.container.classList.toggle(`${this.rootClass}-reduced-motion`, reduced);
  }

  /** Check if reduced motion is currently preferred */
  prefersReducedMotion(): boolean {
    return prefersReducedMotion();
  }

  mount(model: DashboardModel) {
    this.model = model;
    this.render();
  }

  unmount() {
    // Clear hover timers
    for (const timer of this.hoverTimers.values()) {
      clearTimeout(timer);
    }
    this.hoverTimers.clear();
    this.hoverStates.clear();

    // Unmount all widgets before clearing
    for (const [id, widget] of this.mountedWidgets.entries()) {
      try {
        widget.unmount();
      } catch (e) {
        console.error(`Error unmounting widget for tile ${id}:`, e);
      }
    }
    this.mountedWidgets.clear();
    this.resizeCallbacks.clear();
    this.clickCallbacks.clear();
    this.hoverCallbacks.clear();
    this.container.innerHTML = '';
    this.tileEls.clear();
    this.resizeObserver?.disconnect();
    this.model = undefined;
  }

  render() {
    if (!this.model) return;
    const tiles = this.model.getState().toArray();
    // Diff existing vs next
    const nextIds = new Set(tiles.map((t) => String(t.id)));
    // Remove stale tiles and unmount their widgets
    for (const [id, el] of this.tileEls.entries()) {
      if (!nextIds.has(id)) {
        this.unmountWidget(id);
        el.remove();
        this.tileEls.delete(id);
        this.lastRects.delete(id);
        this.resizeCallbacks.delete(id);
        this.clickCallbacks.delete(id);
        this.hoverCallbacks.delete(id);
        // Clear hover timer and state
        const timer = this.hoverTimers.get(id);
        if (timer) {
          clearTimeout(timer);
          this.hoverTimers.delete(id);
        }
        this.hoverStates.delete(id);
      }
    }
    // Upsert current
    for (const t of tiles) {
      const id = String(t.id);
      let el = this.tileEls.get(id);
      let isNew = false;
      if (!el) {
        isNew = true;
        el = this.createTileElement(id);
        this.container.appendChild(el);
        this.tileEls.set(id, el);
      }
      // Update geometry
      el.style.left = `${t.x}%`;
      el.style.top = `${t.y}%`;
      el.style.width = `${t.width}%`;
      el.style.height = `${t.height}%`;

      // Handle widget mounting/updating
      const widgetType = t.meta?.widgetType as string | undefined;
      const effectiveType = widgetType ?? 'default'; // Fall back to 'default' widget
      const existingWidget = this.mountedWidgets.get(id);

      if (isNew && this.widgetRegistry[effectiveType]) {
        // Mount new widget (or default if no type specified)
        this.mountWidget(id, effectiveType, t.meta ?? {}, el);
      } else if (existingWidget && existingWidget.update) {
        // Update existing widget with new meta
        existingWidget.update(t.meta ?? {});
      }
    }
    // Notify tiles changed size due to model update
    this.notifyAllTileResize();
    // Notify listeners (e.g., demos) that a render occurred so overlays can sync
    this.container.dispatchEvent(new CustomEvent(`${this.rootClass}:rendered`));
  }

  private createTileElement(id: string): HTMLElement {
    const el = document.createElement('div');
    el.className = `${this.rootClass}-tile`;
    el.dataset.tileId = id;
    el.style.position = 'absolute';
    el.style.overflow = 'hidden';
    // ARIA accessibility attributes
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', `Tile ${id}`);
    // Make tiles focusable for keyboard navigation
    el.setAttribute('tabindex', '0');

    // Create content container for widgets
    const content = document.createElement('div');
    content.className = `${this.rootClass}-tile-content`;
    content.style.position = 'absolute';
    content.style.inset = '0';
    content.style.overflow = 'hidden';
    el.appendChild(content);

    // Attach tile interaction event listeners
    this.attachTileEventListeners(el, id);

    return el;
  }

  /** Check if event target is on a resize edge overlay */
  private isOnResizeEdge(event: Event): boolean {
    const target = event.target as Element | null;
    if (!target) return false;
    return target.classList?.contains(`${this.rootClass}-edge`) ||
           target.closest?.(`.${this.rootClass}-edge`) !== null;
  }

  /** Attach all interaction event listeners to a tile element */
  private attachTileEventListeners(el: HTMLElement, id: string): void {
    const tileId = id as TileId;

    // Click handler - fires only if not on resize edge and not during drag
    el.addEventListener('click', (event: MouseEvent) => {
      if (this.dragActive) return;
      if (this.isOnResizeEdge(event)) return;
      
      // Fire dashboard-level callback
      this.onTileClick?.(tileId, event);
      
      // Fire widget-level callbacks
      const callbacks = this.clickCallbacks.get(id);
      if (callbacks) {
        for (const cb of callbacks) {
          try {
            cb(event);
          } catch (e) {
            console.error(`Error in click callback for tile ${id}:`, e);
          }
        }
      }
    });

    // Double-click handler
    el.addEventListener('dblclick', (event: MouseEvent) => {
      if (this.dragActive) return;
      if (this.isOnResizeEdge(event)) return;
      this.onTileDoubleClick?.(tileId, event);
    });

    // Context menu handler
    el.addEventListener('contextmenu', (event: MouseEvent) => {
      if (this.onTileContextMenu) {
        this.onTileContextMenu(tileId, event);
      }
    });

    // Focus handlers
    el.addEventListener('focus', () => {
      this.onTileFocus?.(tileId, true);
    });

    el.addEventListener('blur', () => {
      this.onTileFocus?.(tileId, false);
    });

    // Hover handlers with debouncing
    el.addEventListener('mouseenter', (event: MouseEvent) => {
      this.handleTileHover(id, true, event);
    });

    el.addEventListener('mouseleave', (event: MouseEvent) => {
      this.handleTileHover(id, false, event);
    });
  }

  /** Handle hover with debouncing to avoid rapid enter/leave churn */
  private handleTileHover(id: string, entering: boolean, event: MouseEvent): void {
    const tileId = id as TileId;
    const currentState = this.hoverStates.get(id);

    // Clear any pending timer
    const existingTimer = this.hoverTimers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.hoverTimers.delete(id);
    }

    // If state hasn't changed, do nothing
    if (currentState === entering) return;

    // Debounce the hover event
    const timer = setTimeout(() => {
      this.hoverTimers.delete(id);
      this.hoverStates.set(id, entering);

      // Fire dashboard-level callback
      this.onTileHover?.(tileId, entering, event);

      // Fire widget-level callbacks
      const callbacks = this.hoverCallbacks.get(id);
      if (callbacks) {
        for (const cb of callbacks) {
          try {
            cb(entering);
          } catch (e) {
            console.error(`Error in hover callback for tile ${id}:`, e);
          }
        }
      }
    }, this.hoverDebounceMs);

    this.hoverTimers.set(id, timer);
  }

  /** Inject default styles including CSS variables if not already present */
  private injectFocusStyles(): void {
    const styleId = `${this.rootClass}-base-styles`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    // Use centralized styles with CSS custom properties for theming
    style.textContent = getBaseStyles(this.rootClass);
    document.head.appendChild(style);
  }

  private mountWidget(
    id: string,
    widgetType: string,
    meta: Record<string, unknown>,
    tileEl: HTMLElement,
  ): void {
    const factory = this.widgetRegistry[widgetType];
    if (!factory) return;

    const contentEl = tileEl.querySelector(`.${this.rootClass}-tile-content`) as HTMLElement;
    if (!contentEl) return;

    // Set up callback subscriptions for this tile
    if (!this.resizeCallbacks.has(id)) {
      this.resizeCallbacks.set(id, new Set());
    }
    if (!this.clickCallbacks.has(id)) {
      this.clickCallbacks.set(id, new Set());
    }
    if (!this.hoverCallbacks.has(id)) {
      this.hoverCallbacks.set(id, new Set());
    }
    
    const resizeCbs = this.resizeCallbacks.get(id)!;
    const clickCbs = this.clickCallbacks.get(id)!;
    const hoverCbs = this.hoverCallbacks.get(id)!;

    // Track overlays and headers for cleanup
    const overlayCleanups: Array<() => void> = [];

    const ctx: WidgetContext = {
      tileId: id,
      meta,
      element: contentEl,
      tileElement: tileEl,
      onResize: (callback: () => void) => {
        resizeCbs.add(callback);
        return () => resizeCbs.delete(callback);
      },
      onClick: (handler: (event: MouseEvent) => void) => {
        clickCbs.add(handler);
        return () => clickCbs.delete(handler);
      },
      onHover: (handler: (entering: boolean) => void) => {
        hoverCbs.add(handler);
        return () => hoverCbs.delete(handler);
      },
      addOverlay: (element: HTMLElement, position: OverlayPosition = 'top-right') => {
        // Position the overlay absolutely within the tile
        element.style.position = 'absolute';
        element.style.zIndex = '10';
        
        switch (position) {
          case 'top-left':
            element.style.top = '4px';
            element.style.left = '4px';
            break;
          case 'top-right':
            element.style.top = '4px';
            element.style.right = '4px';
            break;
          case 'bottom-left':
            element.style.bottom = '4px';
            element.style.left = '4px';
            break;
          case 'bottom-right':
            element.style.bottom = '4px';
            element.style.right = '4px';
            break;
          case 'center':
            element.style.top = '50%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            break;
        }
        
        tileEl.appendChild(element);
        
        const cleanup = () => {
          element.remove();
          const idx = overlayCleanups.indexOf(cleanup);
          if (idx >= 0) overlayCleanups.splice(idx, 1);
        };
        overlayCleanups.push(cleanup);
        return cleanup;
      },
      addHeader: (element: HTMLElement) => {
        // Create header container if needed
        let headerContainer = tileEl.querySelector(`.${this.rootClass}-tile-header`) as HTMLElement;
        if (!headerContainer) {
          headerContainer = document.createElement('div');
          headerContainer.className = `${this.rootClass}-tile-header`;
          headerContainer.style.position = 'absolute';
          headerContainer.style.top = '0';
          headerContainer.style.left = '0';
          headerContainer.style.right = '0';
          headerContainer.style.zIndex = '5';
          tileEl.insertBefore(headerContainer, contentEl);
        }
        
        headerContainer.appendChild(element);
        
        // Adjust content area to make room for header
        const updateContentArea = () => {
          const headerHeight = headerContainer!.offsetHeight;
          contentEl.style.top = `${headerHeight}px`;
        };
        
        // Initial adjustment
        requestAnimationFrame(updateContentArea);
        
        const cleanup = () => {
          element.remove();
          // If header container is empty, remove it and reset content
          if (headerContainer && headerContainer.childNodes.length === 0) {
            headerContainer.remove();
            contentEl.style.top = '0';
          } else {
            updateContentArea();
          }
          const idx = overlayCleanups.indexOf(cleanup);
          if (idx >= 0) overlayCleanups.splice(idx, 1);
        };
        overlayCleanups.push(cleanup);
        return cleanup;
      },
    };

    try {
      const widget = factory(ctx);
      // Wrap unmount to also clean up overlays
      const originalUnmount = widget.unmount.bind(widget);
      widget.unmount = () => {
        // Clean up all overlays first
        for (const cleanup of [...overlayCleanups]) {
          cleanup();
        }
        originalUnmount();
      };
      widget.mount();
      this.mountedWidgets.set(id, widget);
    } catch (e) {
      console.error(`Error mounting widget "${widgetType}" for tile ${id}:`, e);
    }
  }

  private unmountWidget(id: string): void {
    const widget = this.mountedWidgets.get(id);
    if (widget) {
      try {
        widget.unmount();
      } catch (e) {
        console.error(`Error unmounting widget for tile ${id}:`, e);
      }
      this.mountedWidgets.delete(id);
    }
  }

  private notifyAllTileResize(): void {
    // Only fire if size/position actually changed to reduce noise
    for (const [id, el] of this.tileEls.entries()) {
      const rect = el.getBoundingClientRect();
      const prev = this.lastRects.get(id);
      const cur = { w: rect.width, h: rect.height, l: rect.left, t: rect.top };
      const changed =
        !prev ||
        Math.abs(prev.w - cur.w) > 0.5 ||
        Math.abs(prev.h - cur.h) > 0.5 ||
        Math.abs(prev.l - cur.l) > 0.5 ||
        Math.abs(prev.t - cur.t) > 0.5;
      if (changed) {
        this.lastRects.set(id, cur);
        // Dispatch DOM event for external listeners
        el.dispatchEvent(
          new CustomEvent(`${this.rootClass}:tile-resized`, {
            bubbles: false,
            detail: { width: cur.w, height: cur.h, left: cur.l, top: cur.t },
          }),
        );
        // Notify registered widget resize callbacks
        const callbacks = this.resizeCallbacks.get(id);
        if (callbacks) {
          for (const cb of callbacks) {
            try {
              cb();
            } catch (e) {
              console.error(`Error in resize callback for tile ${id}:`, e);
            }
          }
        }
      }
    }
  }
}

export { BaseDashboard } from './BaseDashboard.js';
export type { BaseDashboardOptions } from './BaseDashboard.js';
export { ConfigPreviewOverlay } from './ConfigPreviewOverlay.js';
export type { ConfigPreviewOptions } from './ConfigPreviewOverlay.js';
export type { Widget, WidgetFactory, WidgetRegistry, WidgetContext, OverlayPosition } from './widgets.js';
export type { ResizeConfig, ResizeSessionHooks, RedistributeConfig } from './resizeSession.js';
export type { EdgeData, GhostTile, RedistributeOption } from './resizeTypes.js';
export { CSS_VARIABLES, getBaseStyles, getConfigPreviewStyles } from './styles.js';
