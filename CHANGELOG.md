# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Fix peer dependency ranges for the 1.x line (e.g. `@pebbledash/renderer-dom` now peers `@pebbledash/core@^1.0.0`).

---

## [0.1.0] - 2025-12-13

Initial public release of the pebbledash dashboard library.

### Added

#### @pebbledash/core
- `DashboardModel` - Central orchestrator for tile layout operations
- `DashboardState` - Immutable state container for tiles
- `Tile` entity with percentage-based coordinates (x, y, width, height)
- `TileGroup` for grouping related tiles
- `HistoryManager` for undo/redo support
- `ConfigManager` for runtime configuration changes with preview support
- `LifecycleManager` for event-driven hooks
- `StrategyRegistry` for pluggable resize, split, and delete behaviors
- `LinearResizeStrategy` for seam-based resize operations
- `HeuristicDeleteStrategy` for intelligent tile deletion
- Decision engine with condition/action nodes for operation validation
- Seam manipulation utilities (`clampSeamDelta`, `applySeamDelta`)
- Persistence adapters: `MemoryAdapter`, `LocalStorageAdapter`, `APIAdapter`
- Snapshot-based state serialization (V1 and V2 formats)
- `getFocusedTile()` method on `InsertionNavigator`
- Exported `InsertionNavigator`, `HoverEdge`, `BoundaryGroup`, `InsertionBoundary`, `EdgeSide`, `Orientation` from internal module
- Full TypeScript support with strict typing

#### @pebbledash/renderer-dom
- `DomRenderer` - Low-level DOM rendering with tile diffing
- `BaseDashboard` - High-level API bundling model, renderer, and overlays
- Widget system with `WidgetFactory` and `WidgetContext`
- Resize overlays with drag-to-resize functionality
- Insert mode overlays for tile insertion
- Keyboard navigation support
- ARIA accessibility attributes and live regions
- Reduced motion support via `prefers-reduced-motion`
- CSS custom properties for theming (`--ud-*` variables)
- ResizeObserver-based container resize handling
- Touch support for mobile devices
- Shift+drag redistribute mode for proportional resizing

#### @pebbledash/react
- `Dashboard` component with all BaseDashboard callbacks exposed as props
- `DashboardProvider` context for sharing state across components
- `useDashboard()` hook for accessing dashboard state, mode, history, and operations
- `useTile(tileId)` hook for accessing individual tile state and methods
- `useTiles()` hook for accessing all tiles
- `DashboardApi` interface for imperative control via ref
- Widget registry support via props
- Automatic cleanup on unmount
- Re-exports of widget types for convenience
- Full TypeScript types exported

#### @pebbledash/web-component
- `<ud-dashboard>` custom element with full Web Component patterns
- Observed attributes: `mode`, `min-tile-width`, `min-tile-height`, `max-tiles`, `overlays`, `keyboard`, `keyboard-undo-redo`, `keyboard-delete`, `use-shadow-dom`
- Custom events: `ud-tile-click`, `ud-tile-dblclick`, `ud-tile-hover`, `ud-tile-focus`, `ud-tile-contextmenu`, `ud-history-change`, `ud-mode-change`, `ud-container-resize`, `ud-resize-start`, `ud-resize-move`, `ud-resize-end`, `ud-tiles-change`, `ud-ready`
- Public methods: `undo()`, `redo()`, `canUndo()`, `canRedo()`, `announce()`, `getTiles()`, `splitTile()`, `deleteTile()`, config preview methods
- Shadow DOM support option
- Proper lifecycle handling
- Re-exports of widget types for convenience

#### @pebbledash/devtools
- `DevToolsAdapter` interface with `onStateSample`, `onDecisionSpan`, `onError`
- `StateSample` interface with `op`, `version`, `tiles`, `timestamp`
- `createConsoleAdapter()` with `enabled`, `prefix`, `logLevel` options
- `createNoopAdapter()` for production builds
- `createBufferedAdapter()` for batching/telemetry use cases

### Documentation
- Architecture overview
- Widget development guide
- Troubleshooting guide
- TypeDoc-generated API reference
- Contributing guidelines
- Publishing guide
- Comprehensive READMEs for React and Web Component packages

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2025-12-13 | Initial public release |

---

[Unreleased]: https://github.com/pebbledash/pebbledash/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pebbledash/pebbledash/releases/tag/v0.1.0
