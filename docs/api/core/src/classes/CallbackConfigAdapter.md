[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / CallbackConfigAdapter

# Class: CallbackConfigAdapter

Defined in: [packages/core/src/config/ConfigPersistence.ts:158](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L158)

Callback-based adapter for custom storage backends.
Wraps user-provided onLoad/onSave callbacks.

Use this adapter when you need to:
- Load config from a file (JSON, YAML, frontmatter)
- Store config in a database
- Use a custom storage mechanism (IndexedDB, cloud storage, etc.)

## Example

```typescript
// JSON file example (in Node.js or Electron)
const adapter = new CallbackConfigAdapter({
  onLoad: async () => {
    const content = await fs.readFile('config.json', 'utf-8');
    return JSON.parse(content);
  },
  onSave: async (config) => {
    await fs.writeFile('config.json', JSON.stringify(config, null, 2));
  }
});

// YAML file example
const yamlAdapter = new CallbackConfigAdapter({
  onLoad: async () => {
    const content = await fs.readFile('config.yml', 'utf-8');
    return yaml.parse(content); // Using a YAML library
  },
  onSave: async (config) => {
    await fs.writeFile('config.yml', yaml.stringify(config));
  }
});

// API example
const apiAdapter = new CallbackConfigAdapter({
  onLoad: async () => {
    const response = await fetch('/api/dashboard/config');
    return response.json();
  },
  onSave: async (config) => {
    await fetch('/api/dashboard/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }
});
```

## Implements

- [`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md)

## Constructors

### Constructor

> **new CallbackConfigAdapter**(`options`): `CallbackConfigAdapter`

Defined in: [packages/core/src/config/ConfigPersistence.ts:163](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L163)

#### Parameters

##### options

`CallbackConfigAdapterOptions`

#### Returns

`CallbackConfigAdapter`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:197](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L197)

Clear stored configuration.
Optional - not all adapters may support this.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`clear`](../interfaces/ConfigPersistenceAdapter.md#clear)

***

### load()

> **load**(): `Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:169](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L169)

Load configuration from storage.

#### Returns

`Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

The loaded config, or null if no config exists

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`load`](../interfaces/ConfigPersistenceAdapter.md#load)

***

### save()

> **save**(`config`): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:193](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L193)

Save configuration to storage.

#### Parameters

##### config

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

The config to save

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`save`](../interfaces/ConfigPersistenceAdapter.md#save)
