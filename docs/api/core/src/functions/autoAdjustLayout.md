[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / autoAdjustLayout

# Function: autoAdjustLayout()

> **autoAdjustLayout**(`state`, `newConfig`, `tileConstraints`): `AutoAdjustResult`

Defined in: [packages/core/src/config/autoAdjust.ts:57](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/autoAdjust.ts#L57)

Auto-adjust the layout when config changes would invalidate existing tiles.

This function uses smart reflow to redistribute space when tiles violate
new constraints (e.g., minTile increased beyond existing tile sizes).

Strategy:
1. Identify violating tiles
2. Try proportional scaling first
3. Fall back to more aggressive redistribution if needed

## Parameters

### state

[`DashboardState`](../classes/DashboardState.md)

Current dashboard state

### newConfig

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

New configuration to apply

### tileConstraints

`Map`\<[`TileId`](../type-aliases/TileId.md), `TileConstraints`\> = `...`

Per-tile constraint overrides

## Returns

`AutoAdjustResult`

Auto-adjustment result
