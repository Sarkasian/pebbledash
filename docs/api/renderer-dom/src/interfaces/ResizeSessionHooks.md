[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / ResizeSessionHooks

# Interface: ResizeSessionHooks

Defined in: packages/renderer-dom/src/resizeTypes.ts:77

Hooks for resize session lifecycle

## Properties

### container

> **container**: `HTMLElement`

Defined in: packages/renderer-dom/src/resizeTypes.ts:80

***

### edge

> **edge**: [`EdgeData`](EdgeData.md)

Defined in: packages/renderer-dom/src/resizeTypes.ts:82

***

### el

> **el**: `HTMLElement`

Defined in: packages/renderer-dom/src/resizeTypes.ts:81

***

### model

> **model**: `DashboardModel`

Defined in: packages/renderer-dom/src/resizeTypes.ts:78

***

### onResizeMove()?

> `optional` **onResizeMove**: (`delta`, `clamped`) => `void`

Defined in: packages/renderer-dom/src/resizeTypes.ts:89

Called during resize with live delta (for preview UI)

#### Parameters

##### delta

`number`

##### clamped

`boolean`

#### Returns

`void`

***

### redistributeConfig?

> `optional` **redistributeConfig**: [`RedistributeConfig`](RedistributeConfig.md)

Defined in: packages/renderer-dom/src/resizeTypes.ts:95

Optional redistribute configuration (Shift + drag)

***

### renderer

> **renderer**: `object`

Defined in: packages/renderer-dom/src/resizeTypes.ts:79

#### render()?

> `optional` **render**: () => `void`

##### Returns

`void`

***

### resizeConfig?

> `optional` **resizeConfig**: [`ResizeConfig`](ResizeConfig.md)

Defined in: packages/renderer-dom/src/resizeTypes.ts:93

Optional resize configuration

***

### startX

> **startX**: `number`

Defined in: packages/renderer-dom/src/resizeTypes.ts:83

***

### startY

> **startY**: `number`

Defined in: packages/renderer-dom/src/resizeTypes.ts:84

## Methods

### clearBoundaryOverlays()

> **clearBoundaryOverlays**(): `void`

Defined in: packages/renderer-dom/src/resizeTypes.ts:90

#### Returns

`void`

***

### onSessionEnd()

> **onSessionEnd**(`committed?`): `void`

Defined in: packages/renderer-dom/src/resizeTypes.ts:87

Called when session ends, with flag indicating if any resize was committed

#### Parameters

##### committed?

`boolean`

#### Returns

`void`

***

### onSessionStart()

> **onSessionStart**(): `void`

Defined in: packages/renderer-dom/src/resizeTypes.ts:85

#### Returns

`void`

***

### rebuildOverlays()

> **rebuildOverlays**(): `void`

Defined in: packages/renderer-dom/src/resizeTypes.ts:91

#### Returns

`void`
