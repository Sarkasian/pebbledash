[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / resolveEdgeToSeamId

# Function: resolveEdgeToSeamId()

> **resolveEdgeToSeamId**(`state`, `tileId`, `edge`, `eps`): `string`

Defined in: [packages/core/src/seams/ids.ts:26](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/seams/ids.ts#L26)

Seam manipulation utilities.

These are exported for backwards compatibility and advanced use cases.
For internal/testing usage, import from '@pebbledash/core/internal' instead.

## Parameters

### state

[`DashboardState`](../classes/DashboardState.md)

### tileId

[`TileId`](../type-aliases/TileId.md)

### edge

`"top"` | `"bottom"` | `"left"` | `"right"`

### eps

`number` = `1e-6`

## Returns

`string`

## See

./internal.ts for the internal utilities module
