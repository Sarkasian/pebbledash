[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ConfigManager

# Class: ConfigManager

Defined in: [packages/core/src/config/ConfigManager.ts:51](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L51)

ConfigManager handles dashboard configuration with full lifecycle events,
validation, persistence, and preview mode support.

## Example

```typescript
const configManager = new ConfigManager({
  dashboardId: 'my-dashboard',
  initialConfig: { minTile: { width: 10, height: 10 } },
  adapter: new LocalStorageConfigAdapter({ dashboardId: 'my-dashboard' }),
  autoSave: true
});

// Subscribe to changes
configManager.on('didChange', ({ previousConfig, newConfig }) => {
  console.log('Config changed:', newConfig);
});

// Update config
await configManager.setConfig({ minTile: { width: 15, height: 15 } });

// Preview mode
configManager.startPreview({ gutter: 4 });
// ... show preview to user ...
await configManager.commitPreview();
```

## Constructors

### Constructor

> **new ConfigManager**(`options`): `ConfigManager`

Defined in: [packages/core/src/config/ConfigManager.ts:66](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L66)

#### Parameters

##### options

[`ConfigManagerOptions`](../interfaces/ConfigManagerOptions.md)

#### Returns

`ConfigManager`

## Methods

### clearStorage()

> **clearStorage**(): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigManager.ts:442](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L442)

Clear saved configuration from the persistence adapter.

#### Returns

`Promise`\<`void`\>

***

### clearTileConstraints()

> **clearTileConstraints**(`tileId`): `void`

Defined in: [packages/core/src/config/ConfigManager.ts:341](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L341)

Clear constraints for a specific tile.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

The tile ID

#### Returns

`void`

***

### commitPreview()

> **commitPreview**(): `Promise`\<[`ConfigChangeResult`](../interfaces/ConfigChangeResult.md)\>

Defined in: [packages/core/src/config/ConfigManager.ts:261](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L261)

Commit the preview configuration as the new config.

#### Returns

`Promise`\<[`ConfigChangeResult`](../interfaces/ConfigChangeResult.md)\>

Result of the commit operation

***

### getAffectedTiles()

> **getAffectedTiles**(`partial`): [`TileId`](../type-aliases/TileId.md)[]

Defined in: [packages/core/src/config/ConfigManager.ts:454](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L454)

Get tiles that would be affected by a config change.

#### Parameters

##### partial

[`PartialExtendedConfig`](../type-aliases/PartialExtendedConfig.md)

Proposed config changes

#### Returns

[`TileId`](../type-aliases/TileId.md)[]

Array of affected tile IDs

***

### getAllTileConstraints()

> **getAllTileConstraints**(): `Map`\<[`TileId`](../type-aliases/TileId.md), `TileConstraints`\>

Defined in: [packages/core/src/config/ConfigManager.ts:348](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L348)

Get all tile constraints.

#### Returns

`Map`\<[`TileId`](../type-aliases/TileId.md), `TileConstraints`\>

***

### getCommittedConfig()

> **getCommittedConfig**(): [`ExtendedConfig`](../interfaces/ExtendedConfig.md)

Defined in: [packages/core/src/config/ConfigManager.ts:101](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L101)

Get the committed configuration (ignoring any active preview).

#### Returns

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

***

### getConfig()

> **getConfig**(): [`ExtendedConfig`](../interfaces/ExtendedConfig.md)

Defined in: [packages/core/src/config/ConfigManager.ts:94](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L94)

Get the current configuration.
Returns preview config if preview is active, otherwise the committed config.

#### Returns

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

***

### getDashboardId()

> **getDashboardId**(): `string`

Defined in: [packages/core/src/config/ConfigManager.ts:78](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L78)

Get the dashboard ID.

#### Returns

`string`

***

### getPreviewConfig()

> **getPreviewConfig**(): [`ExtendedConfig`](../interfaces/ExtendedConfig.md)

Defined in: [packages/core/src/config/ConfigManager.ts:245](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L245)

Get the current preview configuration, or null if not in preview mode.

#### Returns

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

***

### getTileConstraints()

> **getTileConstraints**(`tileId`): `TileConstraints`

Defined in: [packages/core/src/config/ConfigManager.ts:332](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L332)

Get constraints for a specific tile.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

The tile ID

#### Returns

`TileConstraints`

The tile's constraints, or undefined if none set

***

### isPreviewActive()

> **isPreviewActive**(): `boolean`

Defined in: [packages/core/src/config/ConfigManager.ts:252](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L252)

Check if preview mode is active.

#### Returns

`boolean`

***

### load()

> **load**(): `Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

Defined in: [packages/core/src/config/ConfigManager.ts:418](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L418)

Load configuration from the persistence adapter.
Applies migration if needed.

#### Returns

`Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

The loaded config, or null if no saved config exists

***

### on()

> **on**\<`E`\>(`event`, `handler`): () => `void`

Defined in: [packages/core/src/config/ConfigManager.ts:361](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L361)

Subscribe to a configuration event.

#### Type Parameters

##### E

`E` *extends* [`ConfigEvent`](../type-aliases/ConfigEvent.md)

#### Parameters

##### event

`E`

The event type

##### handler

[`ConfigEventHandler`](../type-aliases/ConfigEventHandler.md)\<`E` *extends* `"willChange"` ? `WillChangePayload` : `E` *extends* `"didChange"` ? `DidChangePayload` : `E` *extends* `"validate"` ? `ValidatePayload` : `E` *extends* `"previewStart"` \| `"previewEnd"` \| `"commit"` \| `"revert"` ? `PreviewPayload` : `unknown`\>

The event handler

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### revertPreview()

> **revertPreview**(): `void`

Defined in: [packages/core/src/config/ConfigManager.ts:288](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L288)

Revert preview mode and discard proposed changes.

#### Returns

`void`

***

### save()

> **save**(): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigManager.ts:408](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L408)

Save the current configuration to the persistence adapter.

#### Returns

`Promise`\<`void`\>

***

### setConfig()

> **setConfig**(`partial`): `Promise`\<[`ConfigChangeResult`](../interfaces/ConfigChangeResult.md)\>

Defined in: [packages/core/src/config/ConfigManager.ts:111](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L111)

Update the configuration.

#### Parameters

##### partial

[`PartialExtendedConfig`](../type-aliases/PartialExtendedConfig.md)

Partial configuration to merge with current config

#### Returns

`Promise`\<[`ConfigChangeResult`](../interfaces/ConfigChangeResult.md)\>

Result of the change operation

***

### setDashboardState()

> **setDashboardState**(`state`): `void`

Defined in: [packages/core/src/config/ConfigManager.ts:86](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L86)

Set a reference to the dashboard state for auto-adjustment.
Called by DashboardModel when integrating the ConfigManager.

#### Parameters

##### state

[`DashboardState`](DashboardState.md)

#### Returns

`void`

***

### setTileConstraints()

> **setTileConstraints**(`tileId`, `constraints`): `void`

Defined in: [packages/core/src/config/ConfigManager.ts:316](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L316)

Set constraints for a specific tile.

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

The tile ID

##### constraints

`TileConstraints`

The constraints to apply

#### Returns

`void`

***

### startPreview()

> **startPreview**(`partial`): `void`

Defined in: [packages/core/src/config/ConfigManager.ts:213](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L213)

Start preview mode with proposed configuration changes.

#### Parameters

##### partial

[`PartialExtendedConfig`](../type-aliases/PartialExtendedConfig.md)

Partial configuration to preview

#### Returns

`void`

***

### validateConfig()

> **validateConfig**(`config`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [packages/core/src/config/ConfigManager.ts:202](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigManager.ts#L202)

Validate a configuration object.

#### Parameters

##### config

`unknown`

The configuration to validate

#### Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

Validation result
