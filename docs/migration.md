# Migration Guide

This guide helps you upgrade between major versions of the dashboarding packages.

## Version Compatibility

| Package Version | Node.js | React | Browser Support |
| --------------- | ------- | ----- | --------------- |
| 0.x             | 20+     | 18+   | Modern (ES2022) |

## Migrating to Future Versions

This section will be updated as new versions are released.

### Configuration Changes

The configuration system uses versioned schemas to support migrations:

```typescript
import { ConfigManager, createConfig } from '@pebbledash/core';

// Current config version is 1
const config = createConfig({
  version: 1, // Optional, defaults to current version
  minTile: { width: 10, height: 10 },
  gutter: 4,
});
```

When breaking changes are introduced to the config structure, the version number will be incremented and automatic migration will be supported.

### State Snapshot Format

Dashboard state snapshots use versioned formats:

```typescript
interface SnapshotV1 {
  version: 1;
  tiles: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    locked?: boolean;
    meta?: Record<string, unknown>;
  }>;
}
```

Snapshots from older versions will be automatically migrated when loaded.

## Breaking Change History

### Version 0.x (Current)

Initial release. No breaking changes yet.

## API Stability

The following APIs are considered stable:

- `DashboardModel` - Core model operations
- `DashboardState`, `Tile` - Entity classes
- `HistoryManager` - Undo/redo functionality
- Persistence adapters (`MemoryAdapter`, `LocalStorageAdapter`, `APIAdapter`)
- `StrategyRegistry` - Strategy management
- `ConfigManager` - Runtime configuration

The following APIs may change in minor versions:

- Internal decision engine nodes
- `InsertionNavigator` (internal API)
- Seam utilities (advanced usage)

## Deprecation Policy

When APIs are deprecated:

1. A deprecation warning will be added to the JSDoc
2. The deprecated API will continue to work for at least one minor version
3. Migration instructions will be provided in this guide
4. The API will be removed in the next major version

## Getting Help

If you encounter migration issues:

1. Check the [troubleshooting guide](./troubleshooting.md)
2. Review the [architecture documentation](./architecture.md)
3. Open an issue on GitHub with the `migration` label
