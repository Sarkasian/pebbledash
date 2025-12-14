[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / StateValidationError

# Class: StateValidationError

Defined in: [packages/core/src/errors.ts:95](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L95)

Error thrown when a state validation fails.

## Extends

- [`DashboardError`](DashboardError.md)

## Constructors

### Constructor

> **new StateValidationError**(`code`, `message`, `context?`): `StateValidationError`

Defined in: [packages/core/src/errors.ts:96](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L96)

#### Parameters

##### code

[`ErrorCodeType`](../type-aliases/ErrorCodeType.md)

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`StateValidationError`

#### Overrides

[`DashboardError`](DashboardError.md).[`constructor`](DashboardError.md#constructor)

## Properties

### code

> `readonly` **code**: [`ErrorCodeType`](../type-aliases/ErrorCodeType.md)

Defined in: [packages/core/src/errors.ts:55](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L55)

Error code for programmatic handling

#### Inherited from

[`DashboardError`](DashboardError.md).[`code`](DashboardError.md#code)

***

### context?

> `readonly` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/errors.ts:58](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L58)

Additional context about the error

#### Inherited from

[`DashboardError`](DashboardError.md).[`context`](DashboardError.md#context)

## Methods

### toJSON()

> **toJSON**(): `object`

Defined in: [packages/core/src/errors.ts:73](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L73)

Convert error to JSON for logging/serialization

#### Returns

`object`

##### code

> **code**: [`ErrorCodeType`](../type-aliases/ErrorCodeType.md)

##### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

##### message

> **message**: `string`

#### Inherited from

[`DashboardError`](DashboardError.md).[`toJSON`](DashboardError.md#tojson)
