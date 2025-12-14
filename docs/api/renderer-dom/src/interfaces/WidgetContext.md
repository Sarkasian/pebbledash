[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / WidgetContext

# Interface: WidgetContext

Defined in: [packages/renderer-dom/src/widgets.ts:9](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L9)

Context provided to widget factories when mounting a widget.

## Properties

### addHeader()

> **addHeader**: (`element`) => () => `void`

Defined in: [packages/renderer-dom/src/widgets.ts:36](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L36)

Add a header element above the content (auto-cleanup).

#### Parameters

##### element

`HTMLElement`

The element to add as a header

#### Returns

Cleanup function to remove the header

> (): `void`

##### Returns

`void`

***

### addOverlay()

> **addOverlay**: (`element`, `position?`) => () => `void`

Defined in: [packages/renderer-dom/src/widgets.ts:30](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L30)

Add an overlay element with automatic cleanup on tile removal.

#### Parameters

##### element

`HTMLElement`

The element to add as an overlay

##### position?

[`OverlayPosition`](../type-aliases/OverlayPosition.md)

Position of the overlay (default: 'top-right')

#### Returns

Cleanup function to remove the overlay

> (): `void`

##### Returns

`void`

***

### element

> **element**: `HTMLElement`

Defined in: [packages/renderer-dom/src/widgets.ts:15](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L15)

The DOM element to render widget content into

***

### meta

> **meta**: `Record`\<`string`, `unknown`\>

Defined in: [packages/renderer-dom/src/widgets.ts:13](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L13)

Custom metadata stored on the tile

***

### onClick()

> **onClick**: (`handler`) => () => `void`

Defined in: [packages/renderer-dom/src/widgets.ts:42](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L42)

Subscribe to tile click events.

#### Parameters

##### handler

(`event`) => `void`

Called when the tile is clicked

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### onHover()

> **onHover**: (`handler`) => () => `void`

Defined in: [packages/renderer-dom/src/widgets.ts:48](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L48)

Subscribe to tile hover events.

#### Parameters

##### handler

(`entering`) => `void`

Called when pointer enters/leaves the tile

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### onResize()

> **onResize**: (`callback`) => () => `void`

Defined in: [packages/renderer-dom/src/widgets.ts:23](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L23)

Subscribe to resize events for the tile.

#### Parameters

##### callback

() => `void`

Called when the tile is resized

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### tileElement

> **tileElement**: `HTMLElement`

Defined in: [packages/renderer-dom/src/widgets.ts:17](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L17)

The parent tile element for custom UI injection

***

### tileId

> **tileId**: `string`

Defined in: [packages/renderer-dom/src/widgets.ts:11](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L11)

The unique identifier of the tile
