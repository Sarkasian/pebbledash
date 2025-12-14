[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / PersistenceManager

# Class: PersistenceManager

Defined in: [packages/core/src/persistence/PersistenceManager.ts:3](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceManager.ts#L3)

## Constructors

### Constructor

> **new PersistenceManager**(`adapter`): `PersistenceManager`

Defined in: [packages/core/src/persistence/PersistenceManager.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceManager.ts#L4)

#### Parameters

##### adapter

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md)

#### Returns

`PersistenceManager`

## Methods

### list()

> **list**(`prefix?`): `Promise`\<`string`[]\>

Defined in: [packages/core/src/persistence/PersistenceManager.ts:14](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceManager.ts#L14)

#### Parameters

##### prefix?

`string`

#### Returns

`Promise`\<`string`[]\>

***

### load()

> **load**(`key`): `Promise`\<[`Snapshot`](../type-aliases/Snapshot.md)\>

Defined in: [packages/core/src/persistence/PersistenceManager.ts:11](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceManager.ts#L11)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`Snapshot`](../type-aliases/Snapshot.md)\>

***

### save()

> **save**(`key`, `snapshot`): `Promise`\<`void`\>

Defined in: [packages/core/src/persistence/PersistenceManager.ts:8](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceManager.ts#L8)

#### Parameters

##### key

`string`

##### snapshot

[`Snapshot`](../type-aliases/Snapshot.md)

#### Returns

`Promise`\<`void`\>

***

### setAdapter()

> **setAdapter**(`a`): `void`

Defined in: [packages/core/src/persistence/PersistenceManager.ts:5](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceManager.ts#L5)

#### Parameters

##### a

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md)

#### Returns

`void`
