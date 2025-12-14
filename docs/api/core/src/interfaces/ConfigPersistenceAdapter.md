[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ConfigPersistenceAdapter

# Interface: ConfigPersistenceAdapter

Defined in: [packages/core/src/config/types.ts:165](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L165)

Persistence adapter interface for config storage.
Mirrors the existing PersistenceAdapter pattern used for layout snapshots.

## Methods

### clear()?

> `optional` **clear**(): `Promise`\<`void`\>

Defined in: [packages/core/src/config/types.ts:182](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L182)

Clear stored configuration.
Optional - not all adapters may support this.

#### Returns

`Promise`\<`void`\>

***

### load()

> **load**(): `Promise`\<[`ExtendedConfig`](ExtendedConfig.md)\>

Defined in: [packages/core/src/config/types.ts:170](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L170)

Load configuration from storage.

#### Returns

`Promise`\<[`ExtendedConfig`](ExtendedConfig.md)\>

The loaded config, or null if no config exists

***

### save()

> **save**(`config`): `Promise`\<`void`\>

Defined in: [packages/core/src/config/types.ts:176](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L176)

Save configuration to storage.

#### Parameters

##### config

[`ExtendedConfig`](ExtendedConfig.md)

The config to save

#### Returns

`Promise`\<`void`\>
