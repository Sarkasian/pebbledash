# Plugin Development Guide

This guide explains how to create plugins for the dashboarding library to extend its functionality.

## Overview

Plugins allow you to hook into the dashboard lifecycle and extend its behavior. They're managed by the `PluginManager` and can respond to lifecycle events, add custom strategies, or integrate with external systems.

## Creating a Plugin

### Basic Plugin Structure

All plugins extend the abstract `Plugin` class:

```typescript
import { Plugin } from '@pebbledash/core';

class MyPlugin extends Plugin {
  constructor() {
    super('my-plugin', '1.0.0');
  }

  initialize(model: DashboardModel): void {
    // Called when the plugin is initialized
    console.log('MyPlugin initialized with model:', model);
  }

  cleanup(): void {
    // Called when the plugin is being removed
    console.log('MyPlugin cleaned up');
  }
}
```

### Plugin Lifecycle

1. **Registration**: Plugin is registered with `PluginManager.register(plugin)`
2. **Initialization**: `initialize(model)` is called when `PluginManager.initializeAll()` is invoked
3. **Cleanup**: `cleanup()` is called when `PluginManager.cleanupAll()` is invoked

## Registering Plugins

```typescript
import { DashboardModel, PluginManager } from '@pebbledash/core';

const model = new DashboardModel();
await model.initialize();

// Create plugin manager with the model
const pluginManager = new PluginManager(model);

// Register plugins
pluginManager.register(new MyPlugin());
pluginManager.register(new AnotherPlugin());

// Initialize all plugins
pluginManager.initializeAll();

// Later, when cleaning up
pluginManager.cleanupAll();
```

## Example: Analytics Plugin

Here's a practical example of a plugin that tracks tile operations:

```typescript
import { Plugin, type DashboardModel } from '@pebbledash/core';

interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

class AnalyticsPlugin extends Plugin {
  private events: AnalyticsEvent[] = [];
  private unsubscribe?: () => void;

  constructor() {
    super('analytics', '1.0.0');
  }

  initialize(model: DashboardModel): void {
    // Subscribe to model changes to track all state updates
    this.unsubscribe = model.subscribe(({ op }) => {
      this.trackEvent('state-change', {
        operation: op,
        tileCount: model.getState().toArray().length,
      });
    });

    // Listen to interaction lifecycle events
    model.lifecycle.on('interaction:committed', (ctx) => {
      this.trackEvent('interaction-committed', ctx as Record<string, unknown>);
    });
  }

  private trackEvent(type: string, data?: Record<string, unknown>): void {
    this.events.push({
      type,
      timestamp: Date.now(),
      data,
    });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  cleanup(): void {
    this.unsubscribe?.();
    // Send remaining events to analytics service
    console.log('Final events:', this.events);
    this.events = [];
  }
}
```

## Example: Persistence Plugin

A plugin that auto-saves the dashboard state:

```typescript
import {
  Plugin,
  type DashboardModel,
  LocalStorageAdapter,
  PersistenceManager,
} from '@pebbledash/core';

class AutoSavePlugin extends Plugin {
  private model?: DashboardModel;
  private persistence: PersistenceManager;
  private saveTimeout?: ReturnType<typeof setTimeout>;
  private unsubscribe?: () => void;

  constructor(private readonly key: string = 'dashboard-autosave') {
    super('auto-save', '1.0.0');
    this.persistence = new PersistenceManager(new LocalStorageAdapter());
  }

  async initialize(model: DashboardModel): Promise<void> {
    this.model = model;

    // Restore saved state if available
    const saved = await this.persistence.load(this.key);
    if (saved) {
      model.restoreSnapshot(saved);
    }

    // Subscribe to changes and auto-save with debounce
    this.unsubscribe = model.subscribe(() => {
      this.scheduleSave();
    });
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.save();
    }, 1000); // 1 second debounce
  }

  private async save(): Promise<void> {
    if (!this.model) return;
    const snapshot = this.model.createSnapshot();
    await this.persistence.save(this.key, snapshot);
  }

  cleanup(): void {
    this.unsubscribe?.();
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    // Final save on cleanup
    this.save();
  }
}
```

## Best Practices

1. **Keep plugins focused**: Each plugin should have a single responsibility
2. **Clean up resources**: Always implement `cleanup()` to prevent memory leaks
3. **Use lifecycle events**: Hook into `model.lifecycle` for reactive behavior
4. **Handle errors gracefully**: Wrap operations in try-catch to prevent breaking the dashboard
5. **Document your plugin**: Include usage examples and configuration options

## Available Lifecycle Events

The `LifecycleManager` emits these interaction events:

| Event                       | Description               | Context        |
| --------------------------- | ------------------------- | -------------- |
| `interaction:hover-start`   | Edge hover started        | `{ group }`    |
| `interaction:hover-end`     | Edge hover ended          | `{}`           |
| `interaction:focus-change`  | Boundary focus changed    | `{ boundary }` |
| `interaction:group-update`  | Boundary group updated    | `{ group }`    |
| `interaction:committed`     | Insertion was committed   | `{ result }`   |

For tracking tile operations (split, delete, insert, resize), use the `model.subscribe()` API which provides the operation type and resulting state:

```typescript
model.subscribe(({ op, state, version }) => {
  console.log(`Operation: ${op}, Tiles: ${state.toArray().length}`);
});
```

## TypeScript Support

The plugin system is fully typed. Use the exported types for type safety:

```typescript
import type { DashboardModel, DashboardState, TileId } from '@pebbledash/core';
```
