[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / MemoryAdapter

# Class: MemoryAdapter

Defined in: [packages/core/src/persistence/MemoryAdapter.ts:3](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/MemoryAdapter.ts#L3)

## Implements

- [`PersistenceAdapter`](../interfaces/PersistenceAdapter.md)

## Constructors

### Constructor

> **new MemoryAdapter**(): `MemoryAdapter`

#### Returns

`MemoryAdapter`

## Methods

### list()

> **list**(`prefix?`): `Promise`\<`string`[]\>

Defined in: [packages/core/src/persistence/MemoryAdapter.ts:11](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/MemoryAdapter.ts#L11)

#### Parameters

##### prefix?

`string`

#### Returns

`Promise`\<`string`[]\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`list`](../interfaces/PersistenceAdapter.md#list)

***

### load()

> **load**(`key`): `Promise`\<[`Snapshot`](../type-aliases/Snapshot.md)\>

Defined in: [packages/core/src/persistence/MemoryAdapter.ts:8](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/MemoryAdapter.ts#L8)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`Snapshot`](../type-aliases/Snapshot.md)\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`load`](../interfaces/PersistenceAdapter.md#load)

***

### save()

> **save**(`key`, `snapshot`): `Promise`\<`void`\>

Defined in: [packages/core/src/persistence/MemoryAdapter.ts:5](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/MemoryAdapter.ts#L5)

#### Parameters

##### key

`string`

##### snapshot

[`Snapshot`](../type-aliases/Snapshot.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`save`](../interfaces/PersistenceAdapter.md#save)
