# Troubleshooting Guide

This guide helps resolve common issues when working with the dashboarding packages.

## Common Issues

### Tiles Not Rendering

**Symptom:** The dashboard container appears but no tiles are visible.

**Possible Causes:**

1. **Model not initialized**

   ```typescript
   const model = new DashboardModel();
   await model.initialize(); // Don't forget this!
   ```

2. **Container has no dimensions**

   ```css
   /* Ensure container has explicit dimensions */
   .dashboard-container {
     width: 100%;
     height: 600px;
   }
   ```

3. **Initial layout not provided**
   ```typescript
   await model.initialize({
     layout: {
       tiles: [
         { id: 'tile-1', x: 0, y: 0, width: 50, height: 100 },
         { id: 'tile-2', x: 50, y: 0, width: 50, height: 100 },
       ],
     },
   });
   ```

### Resize Operations Not Working

**Symptom:** Dragging tile edges doesn't resize tiles.

**Possible Causes:**

1. **Mode not set to 'resize'**

   ```typescript
   dashboard.setMode('resize');
   ```

2. **Edge is disabled** - Check if the edge has the `disabled` class (too-small resize range)

3. **Minimum tile size constraint** - Tiles can't be smaller than `minTile` configuration

### Tile Insertion Fails

**Symptom:** Clicking to insert a new tile does nothing.

**Possible Causes:**

1. **Mode not set to 'insert'**

   ```typescript
   dashboard.setMode('insert');
   ```

2. **Maximum tiles reached** - Check `maxTiles` configuration

3. **Invalid insertion location** - The decision engine rejected the operation

### Undo/Redo Not Working

**Symptom:** `model.undo()` or `model.redo()` has no effect.

**Possible Causes:**

1. **No operations to undo/redo**

   ```typescript
   if (model.canUndo()) {
     model.undo();
   }
   ```

2. **History not tracking** - Operations must be performed through the model API

### State Persistence Issues

**Symptom:** Dashboard state is lost on page refresh.

**Solutions:**

1. **Use LocalStorageAdapter**

   ```typescript
   import { LocalStorageAdapter, PersistenceManager } from '@pebbledash/core';

   const adapter = new LocalStorageAdapter({ key: 'my-dashboard' });
   const persistence = new PersistenceManager(model, adapter);

   // Save state
   await persistence.save();

   // Load state
   await persistence.load();
   ```

2. **Use APIAdapter for server persistence**

   ```typescript
   import { APIAdapter } from '@pebbledash/core';

   const adapter = new APIAdapter({
     baseUrl: '/api/dashboard',
     dashboardId: 'dashboard-123',
   });
   ```

### TypeScript Type Errors

**Symptom:** TypeScript complains about types.

**Solutions:**

1. **Import types correctly**

   ```typescript
   import type { TileId, Tile, DashboardState } from '@pebbledash/core';
   ```

2. **Use branded TileId type**
   ```typescript
   const tileId = 'my-tile' as TileId;
   ```

### Performance Issues

**Symptom:** Dashboard feels slow with many tiles.

**Recommendations:**

1. **Limit tile count** - Set `maxTiles` configuration
2. **Use virtual rendering** for tile content
3. **Debounce resize callbacks** in widgets
4. **Minimize re-renders** - Use `subscribe()` selectively

### Accessibility Issues

**Symptom:** Screen readers don't announce tile changes.

**Recommendations:**

1. **Enable overlays** for keyboard navigation

   ```typescript
   const dashboard = new BaseDashboard({
     container: '#dashboard',
     features: {
       overlays: true,
       keyboard: true,
     },
   });
   ```

2. **Check ARIA labels** - Tiles have `role="region"` and `aria-label` by default

3. **Test with screen readers** - Verify the live region announces changes

## Error Messages

### "Tile must be within [0,100] bounds"

The tile coordinates or dimensions are outside valid range. All coordinates are percentages (0-100).

### "Tiles must not overlap"

Two or more tiles have overlapping regions. Ensure tile positions don't intersect.

### "Invalid version"

The configuration or snapshot version doesn't match the expected version. Check `version` field.

### "Config cannot be null or undefined"

The `ConfigManager.setConfig()` was called with an invalid value.

### "Strategy not found"

A named strategy wasn't registered. Check `StrategyRegistry`:

```typescript
model.strategies.setActiveResize('linear'); // Use built-in
model.strategies.registerResize(myStrategy); // Or register custom
```

## Debugging Tips

### Enable DevTools Instrumentation

```typescript
import { createConsoleAdapter } from '@pebbledash/devtools';

const adapter = createConsoleAdapter();
model.lifecycle.on('*', adapter.log);
```

### Inspect Current State

```typescript
console.log('Tiles:', model.getState().toArray());
console.log('Config:', model.getConfigManager().getConfig());
```

### Visualize Seams

```typescript
const seams = model.getState().seams;
console.log('Horizontal seams:', seams.horizontal);
console.log('Vertical seams:', seams.vertical);
```

## Getting Help

If you can't resolve an issue:

1. Review the [architecture guide](./architecture.md)
2. Check the [strategy extension guide](./strategy-extension-guide.md)
3. Search existing GitHub issues
4. Open a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/Node.js version
   - Package versions
