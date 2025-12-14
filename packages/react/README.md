# @pebbledash/react

Full-featured React bindings for `@pebbledash/core` with hooks, context, and all interaction callbacks.

## Installation

```bash
pnpm add @pebbledash/react @pebbledash/renderer-dom @pebbledash/core
```

## Quick Start

```tsx
import { Dashboard } from '@pebbledash/react';

function App() {
  return (
    <Dashboard
      defaults={{ minTile: { width: 10, height: 10 } }}
      features={{ overlays: true, keyboard: true, keyboardUndoRedo: true }}
      widgets={{
        default: (ctx) => ({
          mount: () => { ctx.element.textContent = `Tile ${ctx.tileId}`; },
          unmount: () => { ctx.element.textContent = ''; },
        }),
      }}
      onTileClick={(tileId) => console.log('Clicked:', tileId)}
      onReady={(api) => console.log('Dashboard ready!', api)}
    />
  );
}
```

## Components

### `<Dashboard>`

The main dashboard component. Renders a fully interactive tiled dashboard.

```tsx
import { Dashboard, DashboardApi } from '@pebbledash/react';

function App() {
  const dashboardRef = useRef<DashboardApi>(null);

  return (
    <Dashboard
      ref={dashboardRef}
      className="my-dashboard"
      style={{ height: '600px' }}
      defaults={{ minTile: { width: 10, height: 10 } }}
      initialLayout={{
        tiles: [
          { id: 'tile-1', x: 0, y: 0, width: 50, height: 100 },
          { id: 'tile-2', x: 50, y: 0, width: 50, height: 100 },
        ],
      }}
      features={{
        overlays: true,
        keyboard: true,
        startMode: 'resize',
        keyboardUndoRedo: true,
        keyboardDelete: true,
      }}
      widgets={widgetRegistry}
      onTileClick={(tileId, event) => console.log('Click:', tileId)}
      onTileDoubleClick={(tileId, event) => console.log('Double-click:', tileId)}
      onTileContextMenu={(tileId, event) => handleContextMenu(tileId, event)}
      onHistoryChange={(canUndo, canRedo) => setUndoState({ canUndo, canRedo })}
      onModeChange={(mode, prevMode) => console.log('Mode:', mode)}
      onTilesChange={(tiles) => console.log('Tiles changed:', tiles)}
      onReady={(api) => console.log('Ready!', api)}
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | CSS class for container |
| `style` | `CSSProperties` | Inline styles |
| `widgets` | `WidgetRegistry` | Widget factories by type |
| `defaults` | `DashboardDefaults` | Min/max tile sizes, epsilon |
| `initialLayout` | `InitialLayout` | Initial tile positions |
| `features` | `DashboardFeatures` | Feature flags (overlays, keyboard, etc.) |
| `resizeConfig` | `ResizeConfig` | Resize behavior options |
| `onTileClick` | `(tileId, event) => void` | Tile click handler |
| `onTileDoubleClick` | `(tileId, event) => void` | Double-click handler |
| `onTileHover` | `(tileId, entering, event) => void` | Hover enter/leave |
| `onTileFocus` | `(tileId, focused) => void` | Focus change |
| `onTileContextMenu` | `(tileId, event) => void` | Right-click handler |
| `onHistoryChange` | `(canUndo, canRedo) => void` | Undo/redo state changed |
| `onModeChange` | `(mode, prevMode) => void` | Mode changed |
| `onContainerResize` | `(width, height) => void` | Container resized |
| `onResizeStart` | `(tileId, edge) => void` | Resize drag started |
| `onResizeMove` | `(tileId, edge, delta, clamped) => void` | Resize dragging |
| `onResizeEnd` | `(tileId, edge, committed) => void` | Resize drag ended |
| `onTilesChange` | `(tiles) => void` | Tiles state changed |
| `onReady` | `(api) => void` | Dashboard mounted |

### `<DashboardProvider>`

Optional context provider for sharing dashboard state across components.

```tsx
import { DashboardProvider } from '@pebbledash/react';

function App() {
  return (
    <DashboardProvider>
      <Toolbar />
      <Dashboard widgets={widgets} />
      <TileInspector />
    </DashboardProvider>
  );
}
```

## Hooks

### `useDashboard()`

Access dashboard state and controls from any component.

```tsx
import { useDashboard } from '@pebbledash/react';

function Toolbar() {
  const {
    mode,
    setMode,
    canUndo,
    canRedo,
    undo,
    redo,
    tiles,
    isReady,
    splitTile,
    deleteTile,
  } = useDashboard();

  return (
    <div className="toolbar">
      <button onClick={() => setMode('insert')} disabled={mode === 'insert'}>
        Insert
      </button>
      <button onClick={() => setMode('resize')} disabled={mode === 'resize'}>
        Resize
      </button>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <span>Tiles: {tiles.length}</span>
    </div>
  );
}
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `dashboard` | `DashboardApi \| null` | Dashboard API |
| `model` | `DashboardModel \| null` | Underlying model |
| `mode` | `'insert' \| 'resize'` | Current mode |
| `canUndo` | `boolean` | Undo available |
| `canRedo` | `boolean` | Redo available |
| `isReady` | `boolean` | Dashboard mounted |
| `tiles` | `Tile[]` | All tiles |
| `setMode` | `(mode) => void` | Change mode |
| `undo` | `() => void` | Undo operation |
| `redo` | `() => void` | Redo operation |
| `announce` | `(message) => void` | Screen reader announcement |
| `splitTile` | `(id, opts) => Promise<TileId>` | Split a tile |
| `deleteTile` | `(id) => Promise<boolean>` | Delete a tile |
| `updateTileMeta` | `(id, meta) => void` | Update tile metadata |
| `startConfigPreview` | `(config) => void` | Start config preview |
| `endConfigPreview` | `() => void` | End config preview |

### `useTile(tileId)`

Access a specific tile's state and methods.

```tsx
import { useTile } from '@pebbledash/react';

function TileControls({ tileId }: { tileId: TileId }) {
  const { tile, exists, updateMeta, remove, split, setLocked, isLocked } = useTile(tileId);

  if (!exists) return null;

  return (
    <div>
      <span>Size: {tile.width}% × {tile.height}%</span>
      <button onClick={() => split('vertical')}>Split V</button>
      <button onClick={() => split('horizontal')}>Split H</button>
      <button onClick={() => setLocked(!isLocked)}>
        {isLocked ? 'Unlock' : 'Lock'}
      </button>
      <button onClick={remove}>Delete</button>
    </div>
  );
}
```

### `useTiles()`

Get all tiles in the dashboard.

```tsx
import { useTiles } from '@pebbledash/react';

function TileList() {
  const tiles = useTiles();

  return (
    <ul>
      {tiles.map(tile => (
        <li key={tile.id}>
          {tile.id}: {tile.width}% × {tile.height}%
        </li>
      ))}
    </ul>
  );
}
```

## DashboardApi

The API object exposed via `ref` and `onReady`:

```tsx
interface DashboardApi {
  getModel(): DashboardModel;
  setMode(mode: 'insert' | 'resize'): void;
  getMode(): 'insert' | 'resize';
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  announce(message: string): void;
  startConfigPreview(config: PartialExtendedConfig): void;
  endConfigPreview(): void;
  isConfigPreviewActive(): boolean;
  getPreviewAffectedTiles(): TileId[];
  render(): void;
}
```

## Creating Widgets

Widgets render content inside tiles. Use React with `createRoot`:

```tsx
import { createRoot, Root } from 'react-dom/client';
import type { WidgetContext, Widget } from '@pebbledash/react';

function TileContent({ meta }: { meta: Record<string, unknown> }) {
  return <div className="tile-content">{meta.title as string}</div>;
}

function createReactWidget(ctx: WidgetContext): Widget {
  let root: Root | null = null;

  return {
    mount() {
      root = createRoot(ctx.element);
      root.render(<TileContent meta={ctx.meta} />);
    },
    unmount() {
      root?.unmount();
      root = null;
    },
    update(newMeta) {
      root?.render(<TileContent meta={newMeta} />);
    },
  };
}

// Register widgets
const widgets: WidgetRegistry = {
  default: createReactWidget,
  image: createImageWidget,
  chart: createChartWidget,
};
```

## TypeScript Support

All types are exported:

```tsx
import type {
  // Component props
  DashboardProps,
  DashboardApi,
  DashboardDefaults,
  DashboardFeatures,
  InitialLayout,
  ResizeConfig,
  
  // Hook returns
  DashboardState,
  TileState,
  DashboardContextValue,
  
  // Core types
  TileId,
  Tile,
  ResizeEdge,
  DashboardModel,
  
  // Widget types
  Widget,
  WidgetFactory,
  WidgetRegistry,
  WidgetContext,
} from '@pebbledash/react';
```

## See Also

- [@pebbledash/core](../core/README.md) - Core engine
- [@pebbledash/renderer-dom](../renderer-dom/README.md) - DOM renderer
- [Widget Development Guide](../../docs/widget-development-guide.md)
