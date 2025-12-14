/**
 * Position options for overlay elements
 */
export type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

/**
 * Context provided to widget factories when mounting a widget.
 */
export interface WidgetContext {
  /** The unique identifier of the tile */
  tileId: string;
  /** Custom metadata stored on the tile */
  meta: Record<string, unknown>;
  /** The DOM element to render widget content into */
  element: HTMLElement;
  /** The parent tile element for custom UI injection */
  tileElement: HTMLElement;
  /**
   * Subscribe to resize events for the tile.
   * @param callback - Called when the tile is resized
   * @returns Unsubscribe function
   */
  onResize: (callback: () => void) => () => void;
  /**
   * Add an overlay element with automatic cleanup on tile removal.
   * @param element - The element to add as an overlay
   * @param position - Position of the overlay (default: 'top-right')
   * @returns Cleanup function to remove the overlay
   */
  addOverlay: (element: HTMLElement, position?: OverlayPosition) => () => void;
  /**
   * Add a header element above the content (auto-cleanup).
   * @param element - The element to add as a header
   * @returns Cleanup function to remove the header
   */
  addHeader: (element: HTMLElement) => () => void;
  /**
   * Subscribe to tile click events.
   * @param handler - Called when the tile is clicked
   * @returns Unsubscribe function
   */
  onClick: (handler: (event: MouseEvent) => void) => () => void;
  /**
   * Subscribe to tile hover events.
   * @param handler - Called when pointer enters/leaves the tile
   * @returns Unsubscribe function
   */
  onHover: (handler: (entering: boolean) => void) => () => void;
}

/**
 * Interface for widgets rendered inside dashboard tiles.
 */
export interface Widget {
  /** Mount the widget and render its initial content */
  mount(): void;
  /** Cleanup and remove the widget */
  unmount(): void;
  /** Optional: Update the widget when tile metadata changes */
  update?(meta: Record<string, unknown>): void;
}

/**
 * Factory function that creates a widget instance.
 */
export type WidgetFactory = (ctx: WidgetContext) => Widget;

/**
 * Registry mapping widget type names to their factory functions.
 */
export type WidgetRegistry = Record<string, WidgetFactory>;
