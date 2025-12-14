[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [web-component/src](../README.md) / UDDashboard

# Class: UDDashboard

Defined in: [packages/web-component/src/index.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/web-component/src/index.ts#L4)

## Extends

- `HTMLElement`

## Constructors

### Constructor

> **new UDDashboard**(): `UDDashboard`

Defined in: node\_modules/.pnpm/typescript@5.9.3/node\_modules/typescript/lib/lib.dom.d.ts:13847

#### Returns

`UDDashboard`

#### Inherited from

`HTMLElement.constructor`

## Accessors

### model

#### Get Signature

> **get** **model**(): `DashboardModel`

Defined in: [packages/web-component/src/index.ts:15](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/web-component/src/index.ts#L15)

##### Returns

`DashboardModel`

#### Set Signature

> **set** **model**(`m`): `void`

Defined in: [packages/web-component/src/index.ts:9](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/web-component/src/index.ts#L9)

##### Parameters

###### m

`DashboardModel`

##### Returns

`void`

***

### widgets

#### Get Signature

> **get** **widgets**(): [`WidgetRegistry`](../../../react/src/type-aliases/WidgetRegistry.md)

Defined in: [packages/web-component/src/index.ts:28](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/web-component/src/index.ts#L28)

##### Returns

[`WidgetRegistry`](../../../react/src/type-aliases/WidgetRegistry.md)

#### Set Signature

> **set** **widgets**(`w`): `void`

Defined in: [packages/web-component/src/index.ts:20](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/web-component/src/index.ts#L20)

Registry of widget factories keyed by widget type

##### Parameters

###### w

[`WidgetRegistry`](../../../react/src/type-aliases/WidgetRegistry.md)

##### Returns

`void`

## Methods

### connectedCallback()

> **connectedCallback**(): `void`

Defined in: [packages/web-component/src/index.ts:32](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/web-component/src/index.ts#L32)

#### Returns

`void`

***

### disconnectedCallback()

> **disconnectedCallback**(): `void`

Defined in: [packages/web-component/src/index.ts:37](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/web-component/src/index.ts#L37)

#### Returns

`void`
