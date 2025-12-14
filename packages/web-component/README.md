# @pebbledash/web-component

Full-featured custom element `<ud-dashboard>` for framework-agnostic usage with declarative attributes and custom events.

## Installation

```bash
pnpm add @pebbledash/web-component @pebbledash/renderer-dom @pebbledash/core
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    ud-dashboard {
      display: block;
      width: 100%;
      height: 500px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <ud-dashboard
    id="dashboard"
    mode="resize"
    min-tile-width="10"
    min-tile-height="10"
    overlays
    keyboard
  ></ud-dashboard>

  <script type="module">
    import '@pebbledash/web-component';

    const dashboard = document.getElementById('dashboard');
    
    // Set widgets
    dashboard.widgets = {
      default: (ctx) => ({
        mount: () => { ctx.element.textContent = `Tile ${ctx.tileId}`; },
        unmount: () => { ctx.element.textContent = ''; },
      }),
    };
    
    // Set initial layout
    dashboard.initialLayout = {
      tiles: [
        { id: 'tile-1', x: 0, y: 0, width: 50, height: 100 },
        { id: 'tile-2', x: 50, y: 0, width: 50, height: 100 },
      ],
    };
    
    // Listen for events
    dashboard.addEventListener('ud-tile-click', (e) => {
      console.log('Clicked tile:', e.detail.tileId);
    });
    
    dashboard.addEventListener('ud-ready', (e) => {
      console.log('Dashboard ready!');
    });
  </script>
</body>
</html>
```

## Attributes

Configure the dashboard declaratively using HTML attributes:

| Attribute | Type | Description |
|-----------|------|-------------|
| `mode` | `'insert' \| 'resize'` | Current interaction mode |
| `min-tile-width` | `number` | Minimum tile width (%) |
| `min-tile-height` | `number` | Minimum tile height (%) |
| `max-tiles` | `number` | Maximum number of tiles |
| `overlays` | `boolean` | Enable edge overlays (presence = true) |
| `keyboard` | `boolean` | Enable keyboard navigation |
| `keyboard-undo-redo` | `boolean` | Enable Ctrl+Z / Ctrl+Shift+Z |
| `keyboard-delete` | `boolean` | Enable Delete key for tiles |
| `use-shadow-dom` | `boolean` | Use Shadow DOM for encapsulation |

```html
<ud-dashboard
  mode="insert"
  min-tile-width="15"
  min-tile-height="15"
  max-tiles="20"
  overlays
  keyboard
  keyboard-undo-redo
></ud-dashboard>
```

## Properties

Set complex values via JavaScript properties:

| Property | Type | Description |
|----------|------|-------------|
| `model` | `DashboardModel` | Underlying model (read-only after mount) |
| `widgets` | `WidgetRegistry` | Widget factories by type |
| `initialLayout` | `InitialLayout` | Initial tile positions |
| `config` | `UDDashboardConfig` | Full configuration object |
| `mode` | `'insert' \| 'resize'` | Current mode (read/write) |

```js
const dashboard = document.querySelector('ud-dashboard');

// Set widgets
dashboard.widgets = {
  default: createDefaultWidget,
  chart: createChartWidget,
};

// Set initial layout
dashboard.initialLayout = {
  tiles: [
    { id: 'tile-1', x: 0, y: 0, width: 100, height: 100, meta: { widgetType: 'chart' } },
  ],
};

// Set full config
dashboard.config = {
  minTile: { width: 10, height: 10 },
  maxTiles: 16,
  overlays: true,
  keyboard: true,
  keyboardUndoRedo: true,
  resizeConfig: {
    redistributeEqually: true,
  },
};

// Change mode
dashboard.mode = 'resize';
```

## Events

Listen for dashboard events using standard `addEventListener`:

| Event | Detail | Description |
|-------|--------|-------------|
| `ud-tile-click` | `{ tileId, originalEvent }` | Tile was clicked |
| `ud-tile-dblclick` | `{ tileId, originalEvent }` | Tile was double-clicked |
| `ud-tile-hover` | `{ tileId, entering, originalEvent }` | Pointer entered/left tile |
| `ud-tile-focus` | `{ tileId, focused }` | Tile received/lost focus |
| `ud-tile-contextmenu` | `{ tileId, originalEvent }` | Right-click on tile |
| `ud-history-change` | `{ canUndo, canRedo }` | Undo/redo state changed |
| `ud-mode-change` | `{ mode, previousMode }` | Mode switched |
| `ud-container-resize` | `{ width, height }` | Container was resized |
| `ud-resize-start` | `{ tileId, edge }` | Resize drag started |
| `ud-resize-move` | `{ tileId, edge, delta, clamped }` | Resize dragging |
| `ud-resize-end` | `{ tileId, edge, committed }` | Resize drag ended |
| `ud-tiles-change` | `{ tiles }` | Tiles state changed |
| `ud-ready` | `{ dashboard }` | Dashboard mounted and ready |

```js
const dashboard = document.querySelector('ud-dashboard');

dashboard.addEventListener('ud-tile-click', (e) => {
  const { tileId } = e.detail;
  console.log('Clicked:', tileId);
});

dashboard.addEventListener('ud-history-change', (e) => {
  const { canUndo, canRedo } = e.detail;
  undoBtn.disabled = !canUndo;
  redoBtn.disabled = !canRedo;
});

dashboard.addEventListener('ud-mode-change', (e) => {
  const { mode } = e.detail;
  insertBtn.classList.toggle('active', mode === 'insert');
  resizeBtn.classList.toggle('active', mode === 'resize');
});

dashboard.addEventListener('ud-tiles-change', (e) => {
  const { tiles } = e.detail;
  console.log('Tiles:', tiles.length);
});
```

## Methods

Call methods on the element for programmatic control:

| Method | Arguments | Returns | Description |
|--------|-----------|---------|-------------|
| `undo()` | - | `void` | Undo last operation |
| `redo()` | - | `void` | Redo last undone operation |
| `canUndo()` | - | `boolean` | Check if undo available |
| `canRedo()` | - | `boolean` | Check if redo available |
| `announce(message)` | `string` | `void` | Screen reader announcement |
| `getTiles()` | - | `Tile[]` | Get all tiles |
| `splitTile(id, opts)` | `TileId, { orientation, ratio? }` | `Promise<TileId>` | Split a tile |
| `deleteTile(id)` | `TileId` | `Promise<boolean>` | Delete a tile |
| `startConfigPreview(config)` | `PartialExtendedConfig` | `void` | Start config preview |
| `endConfigPreview()` | - | `void` | End config preview |
| `isConfigPreviewActive()` | - | `boolean` | Check preview active |
| `getPreviewAffectedTiles()` | - | `TileId[]` | Get affected tiles |

```js
const dashboard = document.querySelector('ud-dashboard');

// Toolbar buttons
undoBtn.onclick = () => dashboard.undo();
redoBtn.onclick = () => dashboard.redo();

// Get tiles
const tiles = dashboard.getTiles();
console.log('Tiles:', tiles);

// Split a tile
const newTileId = await dashboard.splitTile('tile-1', {
  orientation: 'vertical',
  ratio: 0.5,
});

// Delete a tile
const success = await dashboard.deleteTile('tile-2');
```

## Shadow DOM

Enable Shadow DOM for style encapsulation:

```html
<ud-dashboard use-shadow-dom></ud-dashboard>
```

Events bubble through the Shadow DOM boundary (`composed: true`).

## Styling

Style the dashboard using CSS custom properties:

```css
ud-dashboard {
  /* Edge overlays */
  --ud-edge-color: rgba(0, 0, 0, 0.1);
  --ud-edge-hover-color: #3b82f6;
  --ud-edge-active-color: #2563eb;
  
  /* Boundary indicators */
  --ud-boundary-color: rgba(59, 130, 246, 0.3);
  --ud-boundary-active-color: rgba(59, 130, 246, 0.6);
}

ud-dashboard .ud-tile {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

ud-dashboard .ud-tile:focus {
  outline: 2px solid #3b82f6;
}
```

## TypeScript Support

Full TypeScript support with exported types:

```ts
import '@pebbledash/web-component';
import type {
  UDDashboard,
  UDDashboardConfig,
  UDDashboardEventMap,
  TileEventDetail,
  TileHoverEventDetail,
  HistoryChangeEventDetail,
  ModeChangeEventDetail,
  TilesChangeEventDetail,
} from '@pebbledash/web-component';

const dashboard = document.querySelector('ud-dashboard') as UDDashboard;

// Type-safe event handling
dashboard.addEventListener('ud-tile-click', (e: CustomEvent<TileEventDetail>) => {
  console.log('Tile:', e.detail.tileId);
});

dashboard.addEventListener('ud-history-change', (e: CustomEvent<HistoryChangeEventDetail>) => {
  console.log('Can undo:', e.detail.canUndo);
});
```

## Framework Integration

### Vue

```vue
<template>
  <ud-dashboard
    ref="dashboard"
    mode="resize"
    overlays
    keyboard
    @ud-tile-click="handleClick"
    @ud-ready="handleReady"
  />
</template>

<script setup>
import '@pebbledash/web-component';
import { ref, onMounted } from 'vue';

const dashboard = ref(null);

onMounted(() => {
  dashboard.value.widgets = { default: createWidget };
  dashboard.value.initialLayout = { tiles: [...] };
});

function handleClick(e) {
  console.log('Clicked:', e.detail.tileId);
}
</script>
```

### Svelte

```svelte
<script>
  import '@pebbledash/web-component';
  import { onMount } from 'svelte';
  
  let dashboard;
  
  onMount(() => {
    dashboard.widgets = { default: createWidget };
    dashboard.initialLayout = { tiles: [...] };
  });
</script>

<ud-dashboard
  bind:this={dashboard}
  mode="resize"
  overlays
  keyboard
  on:ud-tile-click={(e) => console.log(e.detail.tileId)}
/>
```

## See Also

- [@pebbledash/core](../core/README.md) - Core engine
- [@pebbledash/renderer-dom](../renderer-dom/README.md) - DOM renderer
- [Widget Development Guide](../../docs/widget-development-guide.md)
