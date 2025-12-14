[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / HistoryManager

# Class: HistoryManager

Defined in: [packages/core/src/history/HistoryManager.ts:9](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L9)

## Constructors

### Constructor

> **new HistoryManager**(`opts?`): `HistoryManager`

Defined in: [packages/core/src/history/HistoryManager.ts:15](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L15)

#### Parameters

##### opts?

`HistoryOptions`

#### Returns

`HistoryManager`

## Methods

### canRedo()

> **canRedo**(): `boolean`

Defined in: [packages/core/src/history/HistoryManager.ts:52](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L52)

#### Returns

`boolean`

***

### canUndo()

> **canUndo**(): `boolean`

Defined in: [packages/core/src/history/HistoryManager.ts:48](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L48)

#### Returns

`boolean`

***

### clear()

> **clear**(): `void`

Defined in: [packages/core/src/history/HistoryManager.ts:25](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L25)

#### Returns

`void`

***

### record()

> **record**(`state`): `void`

Defined in: [packages/core/src/history/HistoryManager.ts:30](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L30)

#### Parameters

##### state

[`DashboardState`](DashboardState.md)

#### Returns

`void`

***

### redo()

> **redo**(): [`DashboardState`](DashboardState.md)

Defined in: [packages/core/src/history/HistoryManager.ts:62](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L62)

#### Returns

[`DashboardState`](DashboardState.md)

***

### setOnRecord()

> **setOnRecord**(`cb`): `void`

Defined in: [packages/core/src/history/HistoryManager.ts:21](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L21)

Set the onRecord callback (useful for late binding)

#### Parameters

##### cb

(`state`, `canUndo`, `canRedo`) => `void`

#### Returns

`void`

***

### undo()

> **undo**(): [`DashboardState`](DashboardState.md)

Defined in: [packages/core/src/history/HistoryManager.ts:56](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/history/HistoryManager.ts#L56)

#### Returns

[`DashboardState`](DashboardState.md)
