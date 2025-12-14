[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / DecisionContext

# Interface: DecisionContext\<P\>

Defined in: [packages/core/src/decision-engine/types.ts:21](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/decision-engine/types.ts#L21)

Context passed to decision engine conditions and actions.

## Type Parameters

### P

`P` = `unknown`

Type of the params object

## Properties

### config

> **config**: `CoreConfig`

Defined in: [packages/core/src/decision-engine/types.ts:25](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/decision-engine/types.ts#L25)

***

### op

> **op**: [`Operation`](../type-aliases/Operation.md)

Defined in: [packages/core/src/decision-engine/types.ts:23](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/decision-engine/types.ts#L23)

***

### params

> **params**: `P`

Defined in: [packages/core/src/decision-engine/types.ts:24](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/decision-engine/types.ts#L24)

***

### state

> **state**: [`DashboardState`](../classes/DashboardState.md)

Defined in: [packages/core/src/decision-engine/types.ts:22](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/decision-engine/types.ts#L22)
