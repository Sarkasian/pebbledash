# @pebbledash/devtools

Small instrumentation helpers for tracing decisions and sampling dashboard state. Useful for debugging, performance monitoring, and building custom developer tools.

## Installation

```bash
pnpm add @pebbledash/devtools
```

## Quick Start

```ts
import { createConsoleAdapter } from '@pebbledash/devtools';
import { DashboardModel } from '@pebbledash/core';

const model = new DashboardModel();
await model.initialize();

// Create adapter (logging enabled by default in development)
const dev = createConsoleAdapter();
// Or explicitly enable: createConsoleAdapter({ enabled: true })

// Sample state on every operation
const unsubscribe = model.subscribe(({ op, state, version }) => {
  dev.onStateSample({ op, version, tiles: state.toArray() });
});

// Log interaction events via lifecycle hooks
model.lifecycle.on('interaction:committed', ({ result }) => {
  dev.onDecisionSpan(result);
});
```

## Console Adapter

The default console adapter logs to `console` with structured output:

```ts
import { createConsoleAdapter } from '@pebbledash/devtools';

const dev = createConsoleAdapter({
  enabled: true,           // Force enable (default: auto based on NODE_ENV)
  prefix: '[dashboard]',   // Log prefix
  logLevel: 'debug',       // 'debug' | 'info' | 'warn' | 'error'
});
```

### Output Example

```
[dashboard] State sample: op=split, version=3, tiles=4
[dashboard] Decision: splitTile → allowed
[dashboard] Decision: resize → blocked (MinTileSize)
```

## Adapter Interface

Create custom adapters by implementing the interface:

```ts
interface DevToolsAdapter {
  /** Called on each state change */
  onStateSample(sample: StateSample): void;
  
  /** Called when a decision is made */
  onDecisionSpan(result: DecisionResult): void;
  
  /** Called on errors */
  onError?(error: Error, context?: Record<string, unknown>): void;
}

interface StateSample {
  op: string;
  version: number;
  tiles: Tile[];
  timestamp?: number;
}
```

## Example: Custom Adapter

Log to IndexedDB for offline debugging:

```ts
import type { DevToolsAdapter, StateSample, DecisionResult } from '@pebbledash/devtools';

class IndexedDBAdapter implements DevToolsAdapter {
  private db: IDBDatabase | null = null;

  async init() {
    const request = indexedDB.open('dashboard-traces', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('samples', { autoIncrement: true });
      db.createObjectStore('decisions', { autoIncrement: true });
    };
    this.db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  onStateSample(sample: StateSample) {
    if (!this.db) return;
    const tx = this.db.transaction('samples', 'readwrite');
    tx.objectStore('samples').add({
      ...sample,
      timestamp: Date.now(),
    });
  }

  onDecisionSpan(result: DecisionResult) {
    if (!this.db) return;
    const tx = this.db.transaction('decisions', 'readwrite');
    tx.objectStore('decisions').add({
      ...result,
      timestamp: Date.now(),
    });
  }
}
```

## Example: Telemetry Panel

Send metrics to a backend:

```ts
class TelemetryAdapter implements DevToolsAdapter {
  private buffer: StateSample[] = [];
  private flushInterval: ReturnType<typeof setInterval>;

  constructor(private endpoint: string) {
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  onStateSample(sample: StateSample) {
    this.buffer.push(sample);
    if (this.buffer.length >= 100) {
      this.flush();
    }
  }

  onDecisionSpan(result: DecisionResult) {
    // Send immediately for important events
    fetch(this.endpoint + '/decision', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }

  private flush() {
    if (this.buffer.length === 0) return;
    fetch(this.endpoint + '/samples', {
      method: 'POST',
      body: JSON.stringify(this.buffer),
    });
    this.buffer = [];
  }

  cleanup() {
    clearInterval(this.flushInterval);
    this.flush();
  }
}
```

## Lifecycle Events

Available events for instrumentation:

| Event | Description |
|-------|-------------|
| `interaction:hover-start` | Edge hover started |
| `interaction:hover-end` | Edge hover ended |
| `interaction:focus-change` | Boundary focus changed |
| `interaction:committed` | Insert/resize committed |
| `history:record` | State recorded in history |
| `history:undo` | Undo performed |
| `history:redo` | Redo performed |
| `tile:updated` | Tile metadata updated |

```ts
model.lifecycle.on('history:record', ({ state, canUndo, canRedo }) => {
  dev.onStateSample({ op: 'history:record', version: -1, tiles: state.toArray() });
});
```

## Production Usage

The console adapter is disabled by default in production. For production monitoring, create a custom adapter:

```ts
const isDev = process.env.NODE_ENV !== 'production';

const adapter = isDev
  ? createConsoleAdapter()
  : createTelemetryAdapter({ endpoint: '/api/metrics' });
```

> **Note:** The devtools API is considered experimental. Build your own adapter for production use (IndexedDB, backend streaming, etc.).

## See Also

- [@pebbledash/core](../core/README.md) - Core engine
- [Architecture Overview](../../docs/architecture.md)
- [Troubleshooting](../../docs/troubleshooting.md)
