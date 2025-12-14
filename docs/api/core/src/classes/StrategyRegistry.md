[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / StrategyRegistry

# Class: StrategyRegistry

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:84](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L84)

Registry for resize, split, and delete strategies.

Allows customization of tile operations by registering different strategies.

## Example

```typescript
const registry = new StrategyRegistry();

// Register a custom strategy
registry.registerResize(myCustomResizeStrategy);

// Activate it
registry.setActiveResize('my-custom');
```

## Constructors

### Constructor

> **new StrategyRegistry**(): `StrategyRegistry`

#### Returns

`StrategyRegistry`

## Methods

### getDelete()

> **getDelete**(): `DeleteStrategy`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:123](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L123)

#### Returns

`DeleteStrategy`

***

### getResize()

> **getResize**(): `ResizeStrategy`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:113](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L113)

#### Returns

`ResizeStrategy`

***

### getSplit()

> **getSplit**(): `SplitStrategy`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:118](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L118)

#### Returns

`SplitStrategy`

***

### registerDelete()

> **registerDelete**(`s`): `void`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:96](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L96)

#### Parameters

##### s

`DeleteStrategy`

#### Returns

`void`

***

### registerResize()

> **registerResize**(`s`): `void`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:90](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L90)

#### Parameters

##### s

`ResizeStrategy`

#### Returns

`void`

***

### registerSplit()

> **registerSplit**(`s`): `void`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:93](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L93)

#### Parameters

##### s

`SplitStrategy`

#### Returns

`void`

***

### setActiveDelete()

> **setActiveDelete**(`key`): `void`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:108](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L108)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### setActiveResize()

> **setActiveResize**(`key`): `void`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:100](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L100)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### setActiveSplit()

> **setActiveSplit**(`key`): `void`

Defined in: [packages/core/src/strategies/StrategyRegistry.ts:104](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/strategies/StrategyRegistry.ts#L104)

#### Parameters

##### key

`string`

#### Returns

`void`
