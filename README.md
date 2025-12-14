# Pebbledash

> Headless dashboard engine with perfect tiling, pluggable constraints, and optional UI wrappers.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## Overview

Pebbledash is a TypeScript monorepo that provides a complete dashboard tiling solution:

- **`@pebbledash/core`** - Headless layout engine (no DOM dependencies)
- **`@pebbledash/renderer-dom`** - Vanilla DOM renderer with resize/insert interactions
- **`@pebbledash/react`** - Full-featured React bindings with hooks and context
- **`@pebbledash/web-component`** - Web Component wrapper with attributes and events
- **`@pebbledash/devtools`** - Development/debugging instrumentation tools

## Key Features

- **Perfect Tiling**: Tiles always fill 100% of the dashboard area with no gaps or overlaps
- **Constraint-Based Layout**: Configurable minimum/maximum tile sizes with real-time enforcement
- **Undo/Redo**: Full history management with `HistoryManager`
- **Persistence**: Snapshot-based state with multiple adapter options (Memory, LocalStorage, API)
- **Extensible**: Strategy pattern for custom resize, split, and delete behaviors
- **Accessible**: ARIA attributes, keyboard navigation, reduced motion support
- **Framework Agnostic**: Core is pure TypeScript; UI packages available for different environments

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/pebbledash/pebbledash.git
cd pebbledash

# Install dependencies (requires pnpm)
pnpm -w install

# Build all packages
pnpm -w -r build
```

### Development Commands

```bash
# Run tests
pnpm -w test

# Start web demo (after build)
pnpm --filter @pebbledash/app-demo run dev

# Fast demo with live source (skips prebuild)
pnpm demo:fast

# Generate documentation
pnpm docs:decision-tree
```

## Usage

### Core (Headless)

```ts
import { DashboardModel } from '@pebbledash/core';

// Create a model with constraints
const model = new DashboardModel({
  minTile: { width: 10, height: 10 },
  maxTile: { width: 100, height: 100 }
});

// Initialize with default layout
await model.initialize();

// Get tiles
const tiles = model.getState().toArray();

// Split a tile
await model.splitTile(tiles[0].id, { 
  orientation: 'vertical', 
  ratio: 0.5 
});

// Resize via seam
await model.resizeTile(tiles[0].id, 'right', 10);

// Undo/redo
model.undo();
model.redo();

// Persist state
const snapshot = model.createSnapshot();
// ... later ...
await model.restoreSnapshot(snapshot);
```

### DOM Renderer

```ts
import { DashboardModel } from '@pebbledash/core';
import { BaseDashboard } from '@pebbledash/renderer-dom';

const container = document.getElementById('dashboard')!;

const dashboard = new BaseDashboard({
  container,
  widgets: {
    default: (ctx) => ({
      mount: () => {
        ctx.element.textContent = `Tile ${ctx.tileId}`;
      },
      unmount: () => {
        ctx.element.textContent = '';
      }
    })
  },
  onTileClick: (tileId, event) => {
    console.log('Clicked tile:', tileId);
  }
});

const model = new DashboardModel();
await model.initialize();

dashboard.mount(model);

// Enable insert mode
dashboard.setMode('insert');

// Enable resize mode
dashboard.setMode('resize');
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│         (obsidian-pebbledash, custom apps)              │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    Renderer Layer                        │
│  @pebbledash/renderer-dom  │  @pebbledash/react  │ ...  │
│  - BaseDashboard           │  - React bindings   │      │
│  - DomRenderer             │                     │      │
│  - Resize overlays         │                     │      │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                      Core Layer                          │
│                   @pebbledash/core                       │
│  - DashboardModel (state + operations)                  │
│  - StrategyRegistry (resize, split, delete)             │
│  - HistoryManager (undo/redo)                           │
│  - ConfigManager (runtime configuration)                │
│  - PersistenceManager (save/load)                       │
└─────────────────────────────────────────────────────────┘
```

### Core Concepts

- **DashboardModel**: Central orchestrator managing state and operations
- **Tiles**: Rectangular regions defined by percentage coordinates (x, y, width, height)
- **Seams**: Shared edges between adjacent tiles, used for resize operations
- **Strategies**: Pluggable behaviors for resize, split, and delete operations
- **Snapshots**: Serializable state for persistence and undo/redo

## Package Documentation

- [`@pebbledash/core`](./packages/core/README.md) - Core API and concepts
- [`@pebbledash/renderer-dom`](./packages/renderer-dom/README.md) - DOM rendering and interactions
- [`@pebbledash/react`](./packages/react/README.md) - React bindings
- [`@pebbledash/web-component`](./packages/web-component/README.md) - Web Component wrapper

## Additional Documentation

- [Architecture Overview](./docs/architecture.md)
- [Widget Development Guide](./docs/widget-development-guide.md)
- [Troubleshooting](./docs/troubleshooting.md)

## Related Projects

- **[obsidian-pebbledash](https://github.com/pebbledash/obsidian-pebbledash)** - Obsidian plugin powered by pebbledash

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm -w install`
3. Build packages: `pnpm -w -r build`
4. Run tests: `pnpm -w test`
5. Start the demo: `pnpm demo:fast`

### Project Structure

```
pebbledash/
├── packages/
│   ├── core/           # Headless engine
│   ├── renderer-dom/   # DOM renderer
│   ├── react/          # React bindings
│   ├── web-component/  # Web Component wrapper
│   ├── devtools/       # Dev tools (planned)
│   └── app-demo/       # Demo application
├── docs/               # Documentation
└── tests/              # Integration tests
```

## License

MIT
