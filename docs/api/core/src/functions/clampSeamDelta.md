[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / clampSeamDelta

# Function: clampSeamDelta()

> **clampSeamDelta**(`state`, `seamId`, `delta`, `opts?`): `SeamClampResult`

Defined in: [packages/core/src/seams/clamp.ts:13](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/seams/clamp.ts#L13)

Seam manipulation utilities.

These are exported for backwards compatibility and advanced use cases.
For internal/testing usage, import from '@pebbledash/core/internal' instead.

## Parameters

### state

[`DashboardState`](../classes/DashboardState.md)

### seamId

`string`

### delta

`number`

### opts?

#### epsilon?

`number`

#### minTile?

\{ `height`: `number`; `width`: `number`; \}

#### minTile.height

`number`

#### minTile.width

`number`

#### span?

\[`number`, `number`\]

## Returns

`SeamClampResult`

## See

./internal.ts for the internal utilities module
