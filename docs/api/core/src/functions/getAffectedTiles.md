[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / getAffectedTiles

# Function: getAffectedTiles()

> **getAffectedTiles**(`state`, `newConfig`, `tileConstraints`): [`TileId`](../type-aliases/TileId.md)[]

Defined in: [packages/core/src/config/autoAdjust.ts:506](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/autoAdjust.ts#L506)

Get IDs of tiles that would be affected by a config change.

## Parameters

### state

[`DashboardState`](../classes/DashboardState.md)

Current dashboard state

### newConfig

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

Proposed new configuration

### tileConstraints

`Map`\<[`TileId`](../type-aliases/TileId.md), `TileConstraints`\> = `...`

Per-tile constraints

## Returns

[`TileId`](../type-aliases/TileId.md)[]

Array of tile IDs that would need adjustment
