[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / seamIdForEdge

# Function: seamIdForEdge()

> **seamIdForEdge**(`state`, `orientation`, `coord`, `eps`): `string`

Defined in: [packages/core/src/seams/ids.ts:5](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/seams/ids.ts#L5)

Seam manipulation utilities.

These are exported for backwards compatibility and advanced use cases.
For internal/testing usage, import from '@pebbledash/core/internal' instead.

## Parameters

### state

[`DashboardState`](../classes/DashboardState.md)

### orientation

`"horizontal"` | `"vertical"`

### coord

`number`

### eps

`number` = `1e-6`

## Returns

`string`

## See

./internal.ts for the internal utilities module
