[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / PersistenceError

# Class: PersistenceError

Defined in: [packages/core/src/errors.ts:125](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L125)

Error thrown when persistence operations fail.

## Extends

- [`DashboardError`](DashboardError.md)

## Constructors

### Constructor

> **new PersistenceError**(`code`, `message`, `context?`): `PersistenceError`

Defined in: [packages/core/src/errors.ts:126](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L126)

#### Parameters

##### code

[`ErrorCodeType`](../type-aliases/ErrorCodeType.md)

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`PersistenceError`

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
