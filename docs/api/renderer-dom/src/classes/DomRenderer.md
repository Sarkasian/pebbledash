[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / DomRenderer

# Class: DomRenderer

Defined in: [packages/renderer-dom/src/index.ts:33](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L33)

## Constructors

### Constructor

> **new DomRenderer**(`opts`): `DomRenderer`

Defined in: [packages/renderer-dom/src/index.ts:62](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L62)

#### Parameters

##### opts

[`DomRendererOptions`](../interfaces/DomRendererOptions.md)

#### Returns

`DomRenderer`

## Methods

### isDragActive()

> **isDragActive**(): `boolean`

Defined in: [packages/renderer-dom/src/index.ts:107](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L107)

Check if drag is currently active

#### Returns

`boolean`

***

### mount()

> **mount**(`model`): `void`

Defined in: [packages/renderer-dom/src/index.ts:137](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L137)

#### Parameters

##### model

`DashboardModel`

#### Returns

`void`

***

### prefersReducedMotion()

> **prefersReducedMotion**(): `boolean`

Defined in: [packages/renderer-dom/src/index.ts:133](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L133)

Check if reduced motion is currently preferred

#### Returns

`boolean`

***

### render()

> **render**(): `void`

Defined in: [packages/renderer-dom/src/index.ts:168](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L168)

#### Returns

`void`

***

### setDragActive()

> **setDragActive**(`active`): `void`

Defined in: [packages/renderer-dom/src/index.ts:102](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L102)

Set drag active state (called by BaseDashboard during resize operations)

#### Parameters

##### active

`boolean`

#### Returns

`void`

***

### unmount()

> **unmount**(): `void`

Defined in: [packages/renderer-dom/src/index.ts:142](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L142)

#### Returns

`void`
