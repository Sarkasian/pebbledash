[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / DashboardModel

# Class: DashboardModel

Defined in: [packages/core/src/model/DashboardModel.ts:67](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L67)

Main orchestrator for dashboard layout operations.

DashboardModel provides a high-level API for managing tile layouts,
including splitting, deleting, inserting, and resizing tiles.
All operations are validated through a decision engine and support undo/redo.

## Example

```typescript
const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
await model.initialize();

// Split the first tile vertically
const tiles = model.getState().toArray();
await model.splitTile(tiles[0].id, { orientation: 'vertical', ratio: 0.5 });

// Subscribe to changes
model.subscribe(({ state }) => {
  console.log('Tiles:', state.toArray().length);
});
```

## Implements

- `ModelContext`

## Constructors

### Constructor

> **new DashboardModel**(`config?`, `configManagerOptions?`): `DashboardModel`

Defined in: [packages/core/src/model/DashboardModel.ts:99](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L99)

Creates a new DashboardModel instance.

#### Parameters

##### config?

`Partial`\<`CoreConfig`\>

Configuration options for the model

##### configManagerOptions?

Options for the ConfigManager (optional)

###### adapter?

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md)

###### autoSave?

`boolean`

###### dashboardId?

`string`

#### Returns

`DashboardModel`

## Properties

### constraints

> `readonly` **constraints**: `GraphRegistry`

Defined in: [packages/core/src/model/DashboardModel.ts:73](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L73)

***

### interaction

> `readonly` **interaction**: `InteractionState`

Defined in: [packages/core/src/model/DashboardModel.ts:81](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L81)

Current interaction state for UI coordination

***

### lifecycle

> `readonly` **lifecycle**: [`LifecycleManager`](LifecycleManager.md)

Defined in: [packages/core/src/model/DashboardModel.ts:79](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L79)

Lifecycle manager for subscribing to tile operation events

***

### strategies

> `readonly` **strategies**: [`StrategyRegistry`](StrategyRegistry.md)

Defined in: [packages/core/src/model/DashboardModel.ts:72](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L72)

Strategy registry for customizing resize, split, and delete behaviors

## Methods

### canRedo()

> **canRedo**(): `boolean`

Defined in: [packages/core/src/model/DashboardModel.ts:633](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L633)

#### Returns

`boolean`

***

### canUndo()

> **canUndo**(): `boolean`

Defined in: [packages/core/src/model/DashboardModel.ts:630](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L630)

#### Returns

`boolean`

***

### clampResize()

> **clampResize**(`tileId`, `p`): `object`

Defined in: [packages/core/src/model/DashboardModel.ts:510](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L510)

Compute clamped delta for a resize without applying it.
Useful for UI feedback during drag operations.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

ID of the tile to resize

##### p

Resize parameters

###### delta

`number`

###### edge

`"top"` \| `"bottom"` \| `"left"` \| `"right"`

#### Returns

`object`

Clamped delta info including min/max bounds

##### chainCovered

> **chainCovered**: `boolean` = `false`

##### clampedDelta

> **clampedDelta**: `number` = `0`

##### max

> **max**: `number` = `0`

##### min

> **min**: `number` = `0`

***

### clampSeam()

> **clampSeam**(`seamId`, `delta`, `opts?`): `SeamClamp`

Defined in: [packages/core/src/model/DashboardModel.ts:637](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L637)

#### Parameters

##### seamId

`string`

##### delta

`number`

##### opts?

###### span?

\[`number`, `number`\]

#### Returns

`SeamClamp`

***

### createSnapshot()

> **createSnapshot**(`options?`): \{ `tiles`: `object`[]; `version`: `1`; \} \| \{ `settings?`: [`ExtendedConfig`](../interfaces/ExtendedConfig.md); `tiles`: `object`[]; `version`: `2`; \}

Defined in: [packages/core/src/model/DashboardModel.ts:310](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L310)

Create a serializable snapshot of the current state.
Use with `restoreSnapshot()` for persistence.

#### Parameters

##### options?

Optional settings for snapshot creation

###### includeConstraints?

`boolean`

Include per-tile constraints in snapshot (creates V2)

###### includeSettings?

`boolean`

Include dashboard settings in snapshot (creates V2)

#### Returns

\{ `tiles`: `object`[]; `version`: `1`; \} \| \{ `settings?`: [`ExtendedConfig`](../interfaces/ExtendedConfig.md); `tiles`: `object`[]; `version`: `2`; \}

A snapshot object that can be serialized to JSON (V1 or V2 based on options)

***

### deleteTile()

> **deleteTile**(`tileId`): `Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:460](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L460)

Delete a tile from the dashboard.
Adjacent tiles will expand to fill the space.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

ID of the tile to delete

#### Returns

`Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Decision result with validation status

***

### generateTileId()

> **generateTileId**(): [`TileId`](../type-aliases/TileId.md)

Defined in: [packages/core/src/model/DashboardModel.ts:200](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L200)

#### Returns

[`TileId`](../type-aliases/TileId.md)

#### Implementation of

`ModelContext.generateTileId`

***

### getConfig()

> **getConfig**(): `CoreConfig`

Defined in: [packages/core/src/model/DashboardModel.ts:129](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L129)

#### Returns

`CoreConfig`

#### Implementation of

`ModelContext.getConfig`

***

### getConfigManager()

> **getConfigManager**(`dashboardId?`): [`ConfigManager`](ConfigManager.md)

Defined in: [packages/core/src/model/DashboardModel.ts:161](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L161)

Get the configuration manager for runtime config changes.
Creates a new ConfigManager on first access (lazy initialization).

#### Parameters

##### dashboardId?

`string`

Optional dashboard ID (defaults to 'default')

#### Returns

[`ConfigManager`](ConfigManager.md)

The ConfigManager instance

#### Example

```typescript
const configManager = model.getConfigManager('my-dashboard');

// Update minimum tile size
await configManager.setConfig({ minTile: { width: 10, height: 10 } });

// Preview changes before committing
configManager.startPreview({ gutter: 4 });
// ... show preview ...
await configManager.commitPreview();
```

***

### getEngine()

> **getEngine**(): `DecisionEngine`

Defined in: [packages/core/src/model/DashboardModel.ts:212](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L212)

#### Returns

`DecisionEngine`

#### Implementation of

`ModelContext.getEngine`

***

### getHistory()

> **getHistory**(): [`HistoryManager`](HistoryManager.md)

Defined in: [packages/core/src/model/DashboardModel.ts:204](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L204)

#### Returns

[`HistoryManager`](HistoryManager.md)

#### Implementation of

`ModelContext.getHistory`

***

### getLifecycle()

> **getLifecycle**(): [`LifecycleManager`](LifecycleManager.md)

Defined in: [packages/core/src/model/DashboardModel.ts:208](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L208)

#### Returns

[`LifecycleManager`](LifecycleManager.md)

#### Implementation of

`ModelContext.getLifecycle`

***

### getSeamRange()

> **getSeamRange**(`tileId`, `edge`): `object`

Defined in: [packages/core/src/model/DashboardModel.ts:514](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L514)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

##### edge

`"top"` | `"bottom"` | `"left"` | `"right"`

#### Returns

`object`

##### chainCovered

> **chainCovered**: `boolean` = `false`

##### clampedDelta

> **clampedDelta**: `number` = `0`

##### max

> **max**: `number` = `0`

##### min

> **min**: `number` = `0`

***

### getState()

> **getState**(): [`DashboardState`](DashboardState.md)

Defined in: [packages/core/src/model/DashboardModel.ts:298](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L298)

Get the current dashboard state.

#### Returns

[`DashboardState`](DashboardState.md)

The current immutable DashboardState

#### Implementation of

`ModelContext.getState`

***

### getStrategies()

> **getStrategies**(): [`StrategyRegistry`](StrategyRegistry.md)

Defined in: [packages/core/src/model/DashboardModel.ts:216](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L216)

#### Returns

[`StrategyRegistry`](StrategyRegistry.md)

#### Implementation of

`ModelContext.getStrategies`

***

### hasConfigManager()

> **hasConfigManager**(): `boolean`

Defined in: [packages/core/src/model/DashboardModel.ts:196](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L196)

Check if a ConfigManager has been initialized.

#### Returns

`boolean`

***

### initialize()

> **initialize**(`opts?`): `Promise`\<`void`\>

Defined in: [packages/core/src/model/DashboardModel.ts:272](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L272)

Initialize the dashboard with an optional layout.

#### Parameters

##### opts?

Initialization options

###### layout?

\{ `tiles`: `Pick`\<[`Tile`](Tile.md), `"id"` \| `"x"` \| `"y"` \| `"width"` \| `"height"` \| `"locked"` \| `"meta"`\>[]; \}

Initial tile layout (defaults to single full-screen tile)

###### layout.tiles

`Pick`\<[`Tile`](Tile.md), `"id"` \| `"x"` \| `"y"` \| `"width"` \| `"height"` \| `"locked"` \| `"meta"`\>[]

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Initialize with default single tile
await model.initialize();

// Initialize with custom layout
await model.initialize({
  layout: {
    tiles: [
      { id: 'left', x: 0, y: 0, width: 50, height: 100 },
      { id: 'right', x: 50, y: 0, width: 50, height: 100 }
    ]
  }
});
```

***

### insertAtContainerEdge()

> **insertAtContainerEdge**(`p`): `Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:601](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L601)

#### Parameters

##### p

###### side

`"top"` \| `"bottom"` \| `"left"` \| `"right"`

###### size?

`number`

#### Returns

`Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

***

### insertFullSpanAtSeam()

> **insertFullSpanAtSeam**(`p`): `Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:593](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L593)

#### Parameters

##### p

###### orientation

`"horizontal"` \| `"vertical"`

###### seamCoord

`number`

###### side

`"top"` \| `"bottom"` \| `"left"` \| `"right"`

###### size?

`number`

#### Returns

`Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

***

### insertTile()

> **insertTile**(`refId`, `p`): `Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:472](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L472)

Insert a new tile adjacent to an existing tile.

#### Parameters

##### refId

[`TileId`](../type-aliases/TileId.md)

ID of the reference tile

##### p

Insert parameters

###### side

`"top"` \| `"bottom"` \| `"left"` \| `"right"`

Which side to insert on ('left', 'right', 'top', 'bottom')

###### size?

`number`

Size of the new tile as ratio (default: 0.5)

#### Returns

`Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Decision result with validation status

***

### interactionCommit()

> **interactionCommit**(): `Promise`\<`void`\>

Defined in: [packages/core/src/model/DashboardModel.ts:552](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L552)

#### Returns

`Promise`\<`void`\>

***

### interactionHoverEdge()

> **interactionHoverEdge**(`p`): `Promise`\<`void`\>

Defined in: [packages/core/src/model/DashboardModel.ts:534](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L534)

#### Parameters

##### p

###### edgeId

`string`

###### fromTileId?

[`TileId`](../type-aliases/TileId.md)

###### pointer

\{ `xPct`: `number`; `yPct`: `number`; \}

###### pointer.xPct

`number`

###### pointer.yPct

`number`

#### Returns

`Promise`\<`void`\>

***

### interactionHoverEnd()

> **interactionHoverEnd**(): `Promise`\<`void`\>

Defined in: [packages/core/src/model/DashboardModel.ts:559](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L559)

#### Returns

`Promise`\<`void`\>

***

### interactionKeyTab()

> **interactionKeyTab**(): `Promise`\<`void`\>

Defined in: [packages/core/src/model/DashboardModel.ts:545](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L545)

#### Returns

`Promise`\<`void`\>

***

### makeDecisionContext()

> **makeDecisionContext**\<`P`\>(`op`, `params`): `object`

Defined in: [packages/core/src/model/DashboardModel.ts:220](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L220)

#### Type Parameters

##### P

`P`

#### Parameters

##### op

`string`

##### params

`P`

#### Returns

`object`

##### config

> **config**: `CoreConfig`

##### op

> **op**: `any`

##### params

> **params**: `P`

##### state

> **state**: [`DashboardState`](DashboardState.md)

#### Implementation of

`ModelContext.makeDecisionContext`

***

### makeValidationContext()

> **makeValidationContext**(): `object`

Defined in: [packages/core/src/model/DashboardModel.ts:224](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L224)

#### Returns

`object`

##### config

> **config**: `CoreConfig`

##### op

> **op**: `any`

##### params

> **params**: `Record`\<`string`, `never`\>

##### state

> **state**: [`DashboardState`](DashboardState.md)

#### Implementation of

`ModelContext.makeValidationContext`

***

### notify()

> **notify**(`op`): `void`

Defined in: [packages/core/src/model/DashboardModel.ts:247](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L247)

#### Parameters

##### op

`ModelOp`

#### Returns

`void`

#### Implementation of

`ModelContext.notify`

***

### recordHistory()

> **recordHistory**(): `void`

Defined in: [packages/core/src/model/DashboardModel.ts:499](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L499)

Record the current state in history.
Call this after a series of skipHistory operations to create a single undo point.

#### Returns

`void`

***

### redo()

> **redo**(): `void`

Defined in: [packages/core/src/model/DashboardModel.ts:619](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L619)

#### Returns

`void`

***

### resizeSeam()

> **resizeSeam**(`seamId`, `delta`, `opts?`): `Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:644](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L644)

#### Parameters

##### seamId

`string`

##### delta

`number`

##### opts?

###### span?

\[`number`, `number`\]

#### Returns

`Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

***

### resizeTile()

> **resizeTile**(`tileId`, `p`): `Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:488](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L488)

Resize a tile by moving one of its edges.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

ID of the tile to resize

##### p

Resize parameters

###### delta

`number`

Amount to move the edge (positive = expand, negative = shrink)

###### edge

`"top"` \| `"bottom"` \| `"left"` \| `"right"`

Which edge to move ('left', 'right', 'top', 'bottom')

###### skipHistory?

`boolean`

If true, don't record this resize in history (for batched drag operations)

#### Returns

`Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Decision result with validation status

***

### restoreSnapshot()

> **restoreSnapshot**(`s`): `void`

Defined in: [packages/core/src/model/DashboardModel.ts:357](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L357)

Restore state from a previously created snapshot.
Auto-detects V1 vs V2 format.

#### Parameters

##### s

The snapshot to restore

###### settings?

`any`

###### tiles

`Pick`\<[`Tile`](Tile.md), `"id"` \| `"x"` \| `"y"` \| `"width"` \| `"height"` \| `"locked"` \| `"meta"`\> & `object`[]

###### version

`1` \| `2`

#### Returns

`void`

***

### setState()

> **setState**(`state`): `void`

Defined in: [packages/core/src/model/DashboardModel.ts:133](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L133)

#### Parameters

##### state

[`DashboardState`](DashboardState.md)

#### Returns

`void`

#### Implementation of

`ModelContext.setState`

***

### splitTile()

> **splitTile**(`tileId`, `p`): `Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:447](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L447)

Split a tile into two tiles.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

ID of the tile to split

##### p

Split parameters

###### orientation

`"horizontal"` \| `"vertical"`

Direction of the split ('horizontal' or 'vertical')

###### ratio?

`number`

Split ratio (default: 0.5)

#### Returns

`Promise`\<[`DecisionResult`](../interfaces/DecisionResult.md)\>

Decision result with validation status

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Defined in: [packages/core/src/model/DashboardModel.ts:240](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L240)

Subscribe to state changes.

#### Parameters

##### listener

(`c`) => `void`

Callback invoked on each state change

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

#### Example

```typescript
const unsubscribe = model.subscribe(({ state, op }) => {
  console.log(`Operation ${op} resulted in ${state.toArray().length} tiles`);
});
// Later: unsubscribe();
```

***

### undo()

> **undo**(): `void`

Defined in: [packages/core/src/model/DashboardModel.ts:608](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L608)

#### Returns

`void`

***

### updateTile()

> **updateTile**(`tileId`, `patch`): `Promise`\<[`Tile`](Tile.md)\>

Defined in: [packages/core/src/model/DashboardModel.ts:405](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/model/DashboardModel.ts#L405)

Update a tile's properties (meta, locked, constraints).
This method records the change in history for undo/redo support.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

ID of the tile to update

##### patch

`Partial`\<`Pick`\<[`Tile`](Tile.md), `"meta"` \| `"locked"` \| `"constraints"`\>\>

Properties to update (meta, locked, constraints)

#### Returns

`Promise`\<[`Tile`](Tile.md)\>

The updated tile

#### Throws

Error if tile is not found

#### Example

```typescript
// Update tile metadata
await model.updateTile(tileId, {
  meta: { widgetType: 'markdown', contentRef: 'notes/todo.md' }
});

// Lock a tile
await model.updateTile(tileId, { locked: true });
```
