# Dashboard Architecture Overview

## Core Concepts

- **DashboardModel** orchestrates state, strategies, the decision engine, and lifecycle hooks. Internal helpers now live in `model/context.ts` and `model/operations.ts`, keeping the class lean.
- **Seams** represent shared edges between tiles. All resize logic now routes through seam helpers (`clampSeamDelta`, `applySeamDelta`), ensuring every code path uses identical min/max clamp calculations.
- **Decision Engine** executes registered graphs (split/insert/delete/resize/interaction). Each operation builds a `DecisionContext` via the new `ModelContext` helpers. See [Decision Engine Logic Tree](./decision_engine_tree.md) for visual graphs of all operations.
- **Strategies** (`LinearResizeStrategy`, `EqualSplitStrategy`, `RatioSplitStrategy`, `AutomaticResizeStrategy`) are deterministic, pure transformations of `DashboardState`. Placeholder strategies have been replaced with functional implementations or thin wrappers around linear resize.

## Renderers & Interaction

- **InsertionNavigator** (core) computes boundary groups; helper utilities in `interaction/navigator-helpers.ts` keep seam math isolated.
- **DomRenderer/BaseDashboard** (renderer-dom) handle DOM diffing plus pointer sessions. Resize drag logic now lives in `resizeSession.ts`, making it reusable across UI surfaces.
- **React/Web Component wrappers** simply mount the DOM renderer and forward models; regression tests ensure they unmount/remount cleanly.

## Testing Strategy

- **Unit tests** cover state invariants, seam clamp math, and renderer behaviors.
- **Integration tests** validate operation chains (insert → resize → delete) and live resize equivalence.
- **E2E** (Playwright) asserts UI smoothness (no flicker, clamp enforcement, keyboard flows).

## Extensibility

- **Strategies** can be swapped via `StrategyRegistry`.
- **Plugins/Lifecycle** allow instrumentation and policy overrides without touching core operations.
- **Seam APIs** (`clampResize`, `getSeamRange`, `resizeSeam`) provide typed hooks for UI previews, keeping demos thin.

Use this document as the canonical entry point when onboarding or planning deeper refactors.
