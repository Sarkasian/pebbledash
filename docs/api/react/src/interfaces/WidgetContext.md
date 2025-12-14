[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [react/src](../README.md) / WidgetContext

# Interface: WidgetContext

Defined in: packages/renderer-dom/dist/widgets.d.ts:8

Context provided to widget factories when mounting a widget.

## Properties

### addHeader()

> **addHeader**: (`element`) => () => `void`

Defined in: packages/renderer-dom/dist/widgets.d.ts:35

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

Defined in: packages/renderer-dom/dist/widgets.d.ts:29

Add an overlay element with automatic cleanup on tile removal.

#### Parameters

##### element

`HTMLElement`

The element to add as an overlay

##### position?

`OverlayPosition`

Position of the overlay (default: 'top-right')

#### Returns

Cleanup function to remove the overlay

> (): `void`

##### Returns

`void`

***

### element

> **element**: `HTMLElement`

Defined in: packages/renderer-dom/dist/widgets.d.ts:14

The DOM element to render widget content into

***

### meta

> **meta**: `Record`\<`string`, `unknown`\>

Defined in: packages/renderer-dom/dist/widgets.d.ts:12

Custom metadata stored on the tile

***

### onClick()

> **onClick**: (`handler`) => () => `void`

Defined in: packages/renderer-dom/dist/widgets.d.ts:41

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

Defined in: packages/renderer-dom/dist/widgets.d.ts:47

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

Defined in: packages/renderer-dom/dist/widgets.d.ts:22

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

Defined in: packages/renderer-dom/dist/widgets.d.ts:16

The parent tile element for custom UI injection

***

### tileId

> **tileId**: `string`

Defined in: packages/renderer-dom/dist/widgets.d.ts:10

The unique identifier of the tile
