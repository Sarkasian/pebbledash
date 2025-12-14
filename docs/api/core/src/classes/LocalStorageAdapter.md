[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / LocalStorageAdapter

# Class: LocalStorageAdapter

Defined in: [packages/core/src/persistence/LocalStorageAdapter.ts:3](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/LocalStorageAdapter.ts#L3)

## Implements

- [`PersistenceAdapter`](../interfaces/PersistenceAdapter.md)

## Constructors

### Constructor

> **new LocalStorageAdapter**(`namespace`): `LocalStorageAdapter`

Defined in: [packages/core/src/persistence/LocalStorageAdapter.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/LocalStorageAdapter.ts#L4)

#### Parameters

##### namespace

`string` = `'dashboarding'`

#### Returns

`LocalStorageAdapter`

## Methods

### list()

> **list**(`prefix?`): `Promise`\<`string`[]\>

Defined in: [packages/core/src/persistence/LocalStorageAdapter.ts:15](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/LocalStorageAdapter.ts#L15)

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

Defined in: [packages/core/src/persistence/LocalStorageAdapter.ts:11](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/LocalStorageAdapter.ts#L11)

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

Defined in: [packages/core/src/persistence/LocalStorageAdapter.ts:8](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/LocalStorageAdapter.ts#L8)

#### Parameters

##### key

`string`

##### snapshot

[`Snapshot`](../type-aliases/Snapshot.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`save`](../interfaces/PersistenceAdapter.md#save)
