[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / APIAdapter

# Class: APIAdapter

Defined in: [packages/core/src/persistence/APIAdapter.ts:3](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/APIAdapter.ts#L3)

## Implements

- [`PersistenceAdapter`](../interfaces/PersistenceAdapter.md)

## Constructors

### Constructor

> **new APIAdapter**(`baseUrl`, `headers?`): `APIAdapter`

Defined in: [packages/core/src/persistence/APIAdapter.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/APIAdapter.ts#L4)

#### Parameters

##### baseUrl

`string`

##### headers?

`Record`\<`string`, `string`\>

#### Returns

`APIAdapter`

## Methods

### list()

> **list**(`prefix?`): `Promise`\<`string`[]\>

Defined in: [packages/core/src/persistence/APIAdapter.ts:23](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/APIAdapter.ts#L23)

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

Defined in: [packages/core/src/persistence/APIAdapter.ts:17](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/APIAdapter.ts#L17)

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

Defined in: [packages/core/src/persistence/APIAdapter.ts:9](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/APIAdapter.ts#L9)

#### Parameters

##### key

`string`

##### snapshot

[`Snapshot`](../type-aliases/Snapshot.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`PersistenceAdapter`](../interfaces/PersistenceAdapter.md).[`save`](../interfaces/PersistenceAdapter.md#save)
