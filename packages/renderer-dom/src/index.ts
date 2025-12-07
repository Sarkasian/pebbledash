import type { DashboardModel } from '@pebbledash/core';
import type { Widget, WidgetRegistry, WidgetContext } from './widgets.js';

export interface DomRendererOptions {
  container: HTMLElement;
  classNameRoot?: string;
  /** Registry of widget factories keyed by widget type */
  widgets?: WidgetRegistry;
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
  private resizeObserver?: ResizeObserver;
  private reducedMotionQuery?: MediaQueryList;

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

    return el;
  }

  /** Inject default focus indicator styles if not already present */
  private injectFocusStyles(): void {
    const styleId = `${this.rootClass}-focus-styles`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    // WCAG 2.1 AA compliant focus indicators with 3:1 contrast ratio
    style.textContent = `
      .${this.rootClass}-root:focus {
        outline: 3px solid #005fcc;
        outline-offset: 2px;
      }
      .${this.rootClass}-root:focus:not(:focus-visible) {
        outline: none;
      }
      .${this.rootClass}-root:focus-visible {
        outline: 3px solid #005fcc;
        outline-offset: 2px;
      }
      .${this.rootClass}-tile:focus {
        outline: 3px solid #005fcc;
        outline-offset: -3px;
        z-index: 10;
      }
      .${this.rootClass}-tile:focus:not(:focus-visible) {
        outline: none;
      }
      .${this.rootClass}-tile:focus-visible {
        outline: 3px solid #005fcc;
        outline-offset: -3px;
        z-index: 10;
      }
      .${this.rootClass}-edge:focus,
      .${this.rootClass}-edge.active {
        outline: 2px solid #005fcc;
        outline-offset: 1px;
      }
      /* Reduced motion: disable transitions */
      .${this.rootClass}-reduced-motion .${this.rootClass}-tile,
      .${this.rootClass}-reduced-motion .${this.rootClass}-edge {
        transition: none !important;
      }
    `;
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

    // Set up resize callback subscription for this tile
    if (!this.resizeCallbacks.has(id)) {
      this.resizeCallbacks.set(id, new Set());
    }
    const callbacks = this.resizeCallbacks.get(id)!;

    const ctx: WidgetContext = {
      tileId: id,
      meta,
      element: contentEl,
      onResize: (callback: () => void) => {
        callbacks.add(callback);
        return () => callbacks.delete(callback);
      },
    };

    try {
      const widget = factory(ctx);
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
export { ConfigPreviewOverlay } from './ConfigPreviewOverlay.js';
export type { Widget, WidgetFactory, WidgetRegistry, WidgetContext } from './widgets.js';
