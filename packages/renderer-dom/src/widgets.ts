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
  /**
   * Subscribe to resize events for the tile.
   * @param callback - Called when the tile is resized
   * @returns Unsubscribe function
   */
  onResize: (callback: () => void) => () => void;
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
