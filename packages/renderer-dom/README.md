# @pebbledash/renderer-dom

Vanilla DOM renderer for `@pebbledash/core`. Provides tile rendering, resize overlays, keyboard navigation, and a widget system for custom tile content.

## Installation

```bash
pnpm add @pebbledash/renderer-dom @pebbledash/core
```

## Quick Start

### Using DomRenderer (Low-level)

```ts
import { DashboardModel } from '@pebbledash/core';
import { DomRenderer } from '@pebbledash/renderer-dom';

const model = new DashboardModel();
await model.initialize();

const renderer = new DomRenderer({
  container: document.getElementById('dashboard')!,
  widgets: {
    text: createTextWidget,
    image: createImageWidget,
  },
});
renderer.mount(model);
```

### Using BaseDashboard (Recommended)

`BaseDashboard` is a higher-level API that bundles the model, renderer, and overlays together:

```ts
import { BaseDashboard } from '@pebbledash/renderer-dom';

const dashboard = new BaseDashboard({
  container: '#dashboard',
  defaults: {
    minTile: { width: 10, height: 10 },
    epsilon: 1e-6,
  },
  features: {
    overlays: true,
    keyboard: true,
    startMode: 'insert',
    keyboardUndoRedo: true,
  },
  widgets: {
    default: createDefaultWidget,
    text: createTextWidget,
  },
  onTileClick: (tileId, event) => {
    console.log('Tile clicked:', tileId);
  },
});

await dashboard.mount();
```

## BaseDashboard Options

```ts
interface BaseDashboardOptions {
  container: HTMLElement | string;
  
  defaults?: {
    minTile?: { width: number; height: number };
    maxTiles?: number;
    epsilon?: number;
  };
  
  initialLayout?: SnapshotV1 | {
    tiles: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      locked?: boolean;
      meta?: Record<string, unknown>;
    }>;
  };
  
  features?: {
    overlays?: boolean;     // Show resize/insert overlays
    keyboard?: boolean;     // Enable keyboard navigation
    startMode?: 'insert' | 'resize';
    keyboardUndoRedo?: boolean;  // Ctrl+Z / Ctrl+Shift+Z
  };
  
  widgets?: WidgetRegistry;
  
  // Callbacks
  onTileClick?: (tileId: TileId, event: MouseEvent) => void;
  onTileDoubleClick?: (tileId: TileId, event: MouseEvent) => void;
  onTileHover?: (tileId: TileId, entering: boolean, event: MouseEvent) => void;
  onTileFocus?: (tileId: TileId, focused: boolean) => void;
  onTileContextMenu?: (tileId: TileId, event: MouseEvent) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  onModeChange?: (newMode: 'insert' | 'resize', previousMode: 'insert' | 'resize') => void;
  onContainerResize?: (width: number, height: number) => void;
  onResizeStart?: (tileId: TileId, edge: ResizeEdge) => void;
  onResizeMove?: (tileId: TileId, edge: ResizeEdge, delta: number, clamped: boolean) => void;
  onResizeEnd?: (tileId: TileId, edge: ResizeEdge, committed: boolean) => void;
}
```

## Widget System

Widgets render content inside tiles. See the [Widget Development Guide](../../docs/widget-development-guide.md) for full details.

### Widget Interface

```ts
interface Widget {
  mount(): void | Promise<void>;
  unmount(): void;
  update?(newMeta: Record<string, unknown>): void | Promise<void>;
}

type WidgetFactory = (ctx: WidgetContext) => Widget;

interface WidgetContext {
  tileId: string;
  meta: Record<string, unknown>;
  element: HTMLElement;        // Content container
  tileElement: HTMLElement;    // Parent tile element
  onResize: (callback: () => void) => () => void;
  onClick: (handler: (event: MouseEvent) => void) => () => void;
  onHover: (handler: (entering: boolean) => void) => () => void;
  addOverlay: (element: HTMLElement, position?: OverlayPosition) => () => void;
  addHeader: (element: HTMLElement) => () => void;
}
```

### Example Widget

```ts
function createTextWidget(ctx: WidgetContext): Widget {
  return {
    mount() {
      ctx.element.textContent = ctx.meta.text as string || 'Hello!';
    },
    unmount() {
      ctx.element.textContent = '';
    },
    update(newMeta) {
      ctx.element.textContent = newMeta.text as string || 'Hello!';
    },
  };
}
```

## Modes

- **Insert Mode**: Click on tile edges to insert new tiles
- **Resize Mode**: Drag tile edges to resize

Toggle modes:

```ts
dashboard.setMode('resize');
dashboard.setMode('insert');
```

## Config Preview

Preview configuration changes before committing:

```ts
// Start preview
dashboard.startConfigPreview({ minTile: { width: 20, height: 20 } });

// Check affected tiles
const affected = dashboard.getPreviewAffectedTiles();

// Commit or cancel
await dashboard.getModel().getConfigManager().commitPreview();
// or
dashboard.endConfigPreview();
```

## CSS Customization

The renderer injects base styles with CSS custom properties:

```css
/* Override default colors */
.ud-root {
  --ud-edge-color: rgba(0, 0, 0, 0.1);
  --ud-edge-hover-color: rgba(59, 130, 246, 0.5);
  --ud-edge-active-color: rgba(59, 130, 246, 0.8);
  --ud-boundary-color: rgba(59, 130, 246, 0.3);
  --ud-boundary-active-color: rgba(59, 130, 246, 0.6);
}

/* Style tiles */
.ud-tile {
  background: white;
  border: 1px solid #e5e7eb;
}
```

## Accessibility

- Tiles are focusable with `tabindex="0"`
- ARIA `role="region"` on tiles
- Live region for screen reader announcements
- Reduced motion support via `prefers-reduced-motion`

```ts
// Announce custom messages
dashboard.announce('Tile inserted successfully');
```

## API Reference

### BaseDashboard Methods

| Method | Description |
|--------|-------------|
| `mount()` | Initialize and render the dashboard |
| `unmount()` | Clean up and remove from DOM |
| `getModel()` | Get the underlying DashboardModel |
| `setMode(mode)` | Switch between 'insert' and 'resize' |
| `announce(message)` | Send message to ARIA live region |
| `startConfigPreview(config)` | Start configuration preview |
| `endConfigPreview()` | End configuration preview |
| `updateDefaults(partial)` | Update default configuration |

## See Also

- [Widget Development Guide](../../docs/widget-development-guide.md)
- [Architecture Overview](../../docs/architecture.md)
- [@pebbledash/core](../core/README.md)
