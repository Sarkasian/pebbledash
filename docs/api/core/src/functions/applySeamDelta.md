[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / applySeamDelta

# Function: applySeamDelta()

> **applySeamDelta**(`state`, `seamId`, `clamped`, `opts?`): [`DashboardState`](../classes/DashboardState.md)

Defined in: [packages/core/src/seams/apply.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/seams/apply.ts#L4)

Seam manipulation utilities.

These are exported for backwards compatibility and advanced use cases.
For internal/testing usage, import from '@pebbledash/core/internal' instead.

## Parameters

### state

[`DashboardState`](../classes/DashboardState.md)

### seamId

`string`

### clamped

`number`

### opts?

#### epsilon?

`number`

#### span?

\[`number`, `number`\]

## Returns

[`DashboardState`](../classes/DashboardState.md)

## See

./internal.ts for the internal utilities module
