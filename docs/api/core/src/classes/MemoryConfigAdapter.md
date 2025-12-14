[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / MemoryConfigAdapter

# Class: MemoryConfigAdapter

Defined in: [packages/core/src/config/ConfigPersistence.ts:14](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L14)

In-memory only adapter - no persistence.
Useful for testing or when persistence is not needed.

## Implements

- [`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md)

## Constructors

### Constructor

> **new MemoryConfigAdapter**(): `MemoryConfigAdapter`

#### Returns

`MemoryConfigAdapter`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:25](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L25)

Clear stored configuration.
Optional - not all adapters may support this.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`clear`](../interfaces/ConfigPersistenceAdapter.md#clear)

***

### load()

> **load**(): `Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:17](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L17)

Load configuration from storage.

#### Returns

`Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

The loaded config, or null if no config exists

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`load`](../interfaces/ConfigPersistenceAdapter.md#load)

***

### save()

> **save**(`config`): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:21](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L21)

Save configuration to storage.

#### Parameters

##### config

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

The config to save

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`save`](../interfaces/ConfigPersistenceAdapter.md#save)
