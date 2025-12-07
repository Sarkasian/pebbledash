# @pebbledash/devtools (optional)

Small instrumentation helpers for tracing decisions and sampling dashboard state. The default adapter logs to `console` (disabled in production by default), but the API is intentionally tiny so custom sinks (telemetry panels, downloadable traces, etc.) can be plugged in without touching the core packages.

```ts
import { createConsoleAdapter } from '@pebbledash/devtools';
import { DashboardModel } from '@pebbledash/core';

const model = new DashboardModel();
await model.initialize();

// Create adapter (logging enabled by default in development)
const dev = createConsoleAdapter();
// Or explicitly enable: createConsoleAdapter({ enabled: true })

// Sample state on every operation via subscription
const unsubscribe = model.subscribe(({ op, state, version }) => {
  dev.onStateSample({ op, version, tiles: state.toArray() });
});

// Log interaction events via lifecycle hooks
model.lifecycle.on('interaction:committed', ({ result }) => {
  dev.onDecisionSpan(result);
});
```

> **Note:** The API is considered experimental. Expect to build your own adapter for production use (save spans to IndexedDB, stream to a backend, etc.).
