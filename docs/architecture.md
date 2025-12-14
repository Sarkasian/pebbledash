# Dashboard Architecture Overview

This document provides a comprehensive overview of the pebbledash architecture, including data flow diagrams, component relationships, and design decisions.

## Table of Contents

- [Package Structure](#package-structure)
- [Core Concepts](#core-concepts)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Operation Pipeline](#operation-pipeline)
- [Rendering Architecture](#rendering-architecture)
- [Widget System](#widget-system)
- [Extensibility](#extensibility)
- [Testing Strategy](#testing-strategy)

---

## Package Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Application Layer                             │
│            (obsidian-pebbledash, custom applications)               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                         Renderer Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  renderer-dom   │  │     react       │  │   web-component     │  │
│  │  - DomRenderer  │  │  - Dashboard    │  │  - <ud-dashboard>   │  │
│  │  - BaseDashboard│  │    component    │  │    custom element   │  │
│  │  - Overlays     │  │                 │  │                     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                          Core Layer                                  │
│                       @pebbledash/core                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     DashboardModel                           │    │
│  │  - State management      - History (undo/redo)               │    │
│  │  - Operation execution   - Lifecycle events                  │    │
│  │  - Configuration         - Subscription system               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────────────┐   │
│  │ Strategies   │  │ Decision Engine│  │ Persistence            │   │
│  │ - Resize     │  │ - Conditions   │  │ - Snapshots            │   │
│  │ - Split      │  │ - Actions      │  │ - Adapters             │   │
│  │ - Delete     │  │ - Graphs       │  │   (Memory, Storage, API)│   │
│  └──────────────┘  └────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### DashboardModel

The central orchestrator managing state and operations:

```typescript
DashboardModel
├── state: DashboardState          // Immutable tile collection
├── strategies: StrategyRegistry   // Pluggable behaviors
├── constraints: GraphRegistry     // Decision engine graphs
├── history: HistoryManager        // Undo/redo stack
├── lifecycle: LifecycleManager    // Event hooks
├── interaction: InteractionState  // UI coordination state
└── configManager: ConfigManager   // Runtime configuration
```

### Tiles

Rectangular regions defined by percentage coordinates:

```typescript
interface Tile {
  id: TileId;           // Unique identifier
  x: number;            // Left position (0-100%)
  y: number;            // Top position (0-100%)
  width: number;        // Width (0-100%)
  height: number;       // Height (0-100%)
  locked?: boolean;     // Prevent modifications
  meta?: Record<...>;   // Custom data (widget type, etc.)
}
```

### Seams

Shared edges between adjacent tiles. Seams are the foundation for resize operations:

```
  ┌─────────────┬─────────────┐
  │             │             │
  │   Tile A    │   Tile B    │
  │             │             │
  │             │             │
  └─────────────┴─────────────┘
                ↑
          Vertical Seam
        (shared by A & B)
```

Seam operations:
- `clampSeamDelta()` - Calculate valid resize range
- `applySeamDelta()` - Apply resize transformation
- `seamIdForEdge()` - Get seam ID from tile edge

---

## Data Flow

### Operation Execution Flow

```
User Action (click, drag, keyboard)
        │
        ▼
┌─────────────────────────────────────┐
│         UI Layer (DOM/React)         │
│  - Captures events                   │
│  - Translates to model operations    │
└─────────────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────┐
│          DashboardModel              │
│  1. Build DecisionContext            │
│  2. Execute Decision Graph           │
│  3. Apply Strategy                   │
│  4. Update State                     │
│  5. Record History                   │
│  6. Notify Subscribers               │
└─────────────────────┬───────────────┘
                      │
                      ▼
┌─────────────────────────────────────┐
│         Renderer (DomRenderer)       │
│  - Diff old/new state                │
│  - Update DOM elements               │
│  - Mount/unmount widgets             │
│  - Update overlays                   │
└─────────────────────────────────────┘
```

### Resize Operation Flow

```
Pointer Down on Edge
        │
        ▼
┌─────────────────────────────────────┐
│     startResizeSession()             │
│  - Capture initial state             │
│  - Calculate clamp bounds            │
│  - Set up event listeners            │
└─────────────────────┬───────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           │
┌─────────────────────┐             │
│   Pointer Move      │ ←───────────┘
│  1. Calculate delta │    (repeats)
│  2. Clamp to bounds │
│  3. Preview resize  │
│  4. Update UI       │
└─────────────────────┘
        │
        ▼ (on pointer up)
┌─────────────────────────────────────┐
│     Commit or Cancel                 │
│  - If moved: commit to model         │
│  - If cancelled: restore state       │
│  - Record in history                 │
│  - Clean up listeners                │
└─────────────────────────────────────┘
```

---

## State Management

### Immutable State

`DashboardState` is immutable. Operations return new state instances:

```typescript
// State holds tiles in an immutable Map
class DashboardState {
  readonly tiles: Map<TileId, Tile>;
  readonly groups: Map<string, TileGroup>;
  
  // Returns new state with updated tile
  updateTile(id: TileId, patch: Partial<Tile>): DashboardState
  
  // Returns new state without tile
  removeTile(id: TileId): DashboardState
  
  // Convert to array for iteration
  toArray(): Tile[]
}
```

### History Management

```
┌─────────────────────────────────────────────────┐
│                 HistoryManager                   │
│                                                  │
│   Past Stack          │    Future Stack          │
│   ┌─────────────┐     │    ┌─────────────┐      │
│   │  State N-2  │     │    │  State N+1  │      │
│   ├─────────────┤     │    ├─────────────┤      │
│   │  State N-1  │ ◄───┼─── │  State N+2  │      │
│   └─────────────┘     │    └─────────────┘      │
│         ↑             │          ↑              │
│       Undo            │        Redo             │
│                       │                          │
│              Current: State N                    │
└─────────────────────────────────────────────────┘
```

---

## Operation Pipeline

### Decision Engine

Operations are validated through decision graphs before execution:

```typescript
// Each operation type has a registered graph
constraints.register('split', new SequenceNode([
  TileExists(),      // Tile must exist
  NotLocked(),       // Tile must not be locked
]));

constraints.register('delete', new SequenceNode([
  TileExists(),
  NotLocked(),
  NotOnlyTile(),     // Can't delete last tile
  GroupPolicyAllowsDelete(),
  FullSpanSeamAvailable(),
  ResizableNeighborAvailable(),
]));
```

### Condition Nodes

Conditions validate operation preconditions:

| Condition | Description |
|-----------|-------------|
| `TileExists` | Target tile exists in state |
| `NotLocked` | Tile is not locked |
| `NotOnlyTile` | Dashboard has more than one tile |
| `BoundsValid` | Tile coordinates within 0-100 |
| `CoverageTight` | No gaps or overlaps |
| `MinTileSizeAll` | All tiles meet minimum size |

### Strategy Pattern

Strategies implement the actual transformation logic:

```typescript
interface ResizeStrategy {
  resize(state: DashboardState, params: ResizeParams): DashboardState;
}

// Built-in strategies
- LinearResizeStrategy    // Moves seam linearly
- EqualSplitStrategy      // Splits at 50%
- RatioSplitStrategy      // Splits at specified ratio
- HeuristicDeleteStrategy // Fills space intelligently
```

---

## Rendering Architecture

### DomRenderer

Low-level DOM manipulation:

```typescript
class DomRenderer {
  // Lifecycle
  mount(model: DashboardModel): void
  unmount(): void
  render(): void
  
  // Widget management
  private mountWidget(id, type, meta, element): void
  private unmountWidget(id): void
  
  // Event delegation
  private attachTileEventListeners(el, id): void
}
```

### BaseDashboard

High-level API combining model, renderer, and overlays:

```typescript
class BaseDashboard {
  // Initialization
  async mount(): Promise<void>
  unmount(): void
  
  // Mode control
  setMode(mode: 'insert' | 'resize'): void
  
  // Model access
  getModel(): DashboardModel
  
  // Accessibility
  announce(message: string): void
  
  // Config preview
  startConfigPreview(config): void
  endConfigPreview(): void
}
```

### Overlay System

Overlays provide visual feedback for resize and insert operations:

```
┌─────────────────────────────────────────────────┐
│  Dashboard Container                             │
│  ┌─────────────────┬─────────────────┐          │
│  │                 │                 │          │
│  │    Tile A       │    Tile B       │          │
│  │                 │                 │          │
│  └─────────────────┴─────────────────┘          │
│         ↑                   ↑                   │
│    .ud-edge (vertical)  .ud-edge (vertical)     │
│                                                  │
│  Insert mode: Click edge → insert new tile      │
│  Resize mode: Drag edge → resize tiles          │
└─────────────────────────────────────────────────┘
```

---

## Widget System

### Widget Lifecycle

```
┌──────────────────────────────────────────────────┐
│                  WidgetFactory                    │
│              (ctx: WidgetContext)                 │
└───────────────────────┬──────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│                    Widget                         │
│  ┌──────────────────────────────────────────┐    │
│  │  mount()                                  │    │
│  │  - Create DOM elements                    │    │
│  │  - Attach event listeners                 │    │
│  │  - Subscribe to resize callbacks          │    │
│  └──────────────────────────────────────────┘    │
│                        │                          │
│                        ▼                          │
│  ┌──────────────────────────────────────────┐    │
│  │  update(newMeta)  (optional)              │    │
│  │  - Called when tile metadata changes      │    │
│  │  - Update content without full remount    │    │
│  └──────────────────────────────────────────┘    │
│                        │                          │
│                        ▼                          │
│  ┌──────────────────────────────────────────┐    │
│  │  unmount()                                │    │
│  │  - Remove DOM elements                    │    │
│  │  - Clean up event listeners               │    │
│  │  - Release resources                      │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### WidgetContext

```typescript
interface WidgetContext {
  tileId: string;           // Tile identifier
  meta: Record<...>;        // Tile metadata
  element: HTMLElement;     // Render target
  tileElement: HTMLElement; // Parent tile
  
  // Callbacks
  onResize: (callback) => unsubscribe
  onClick: (handler) => unsubscribe
  onHover: (handler) => unsubscribe
  
  // UI helpers
  addOverlay: (element, position) => remove
  addHeader: (element) => remove
}
```

---

## Extensibility

### Strategy Registry

Swap built-in strategies with custom implementations:

```typescript
// Register custom resize strategy
model.strategies.registerResize(new MyCustomResizeStrategy());

// Use specific strategy for operation
model.strategies.setActiveResize('myCustomStrategy');
```

### Lifecycle Hooks

Subscribe to tile operation events:

```typescript
// Before operation
model.lifecycle.on('tile:willSplit', (ctx) => {
  console.log('About to split:', ctx.tileId);
});

// After operation
model.lifecycle.on('tile:didSplit', (ctx) => {
  console.log('Split complete:', ctx.newTileId);
});

// History events
model.lifecycle.on('history:record', (ctx) => {
  console.log('State recorded:', ctx.canUndo, ctx.canRedo);
});
```

### Config Manager

Runtime configuration with preview support:

```typescript
const configManager = model.getConfigManager();

// Update configuration
await configManager.setConfig({ minTile: { width: 15, height: 15 } });

// Preview changes before committing
configManager.startPreview({ gutter: 8 });
// ... show preview UI ...
await configManager.commitPreview(); // or cancelPreview()

// Per-tile constraints
configManager.setTileConstraints(tileId, {
  minWidth: 20,
  maxWidth: 50,
  lockedZones: ['top', 'left'],
});
```

---

## Testing Strategy

### Unit Tests

Cover isolated functionality:

```
tests/unit/core/
├── entities/          # Tile, TileGroup, DashboardState
├── seams/             # Clamp, apply, ID generation
├── strategies/        # Resize, split, delete strategies
├── decision/          # Condition nodes, graphs
├── persistence/       # Adapters, snapshots
└── config/            # ConfigManager, validation
```

### Integration Tests

Validate operation chains:

```
tests/integration/
├── core-engine-ops/   # insert → resize → delete
├── history/           # Undo/redo across operations
└── model/             # Seam equivalence
```

### E2E Tests

Assert UI behavior with Playwright:

```
e2e/playwright/
├── resize.spec.ts     # Drag resize interactions
├── insert.spec.ts     # Click to insert
├── keyboard.spec.ts   # Keyboard navigation
├── touch.spec.ts      # Mobile interactions
└── clamp.spec.ts      # Min/max enforcement
```

---

## Further Reading

- [Decision Engine Logic Tree](./decision_engine_tree.md) - Visual graphs of all operations
- [Widget Development Guide](./widget-development-guide.md) - Creating custom widgets
- [Strategy Extension Guide](./strategy-extension-guide.md) - Custom strategies
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

Use this document as the canonical entry point when onboarding or planning deeper refactors.
