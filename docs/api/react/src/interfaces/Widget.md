[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [react/src](../README.md) / Widget

# Interface: Widget

Defined in: packages/renderer-dom/dist/widgets.d.ts:52

Interface for widgets rendered inside dashboard tiles.

## Methods

### mount()

> **mount**(): `void`

Defined in: packages/renderer-dom/dist/widgets.d.ts:54

Mount the widget and render its initial content

#### Returns

`void`

***

### unmount()

> **unmount**(): `void`

Defined in: packages/renderer-dom/dist/widgets.d.ts:56

Cleanup and remove the widget

#### Returns

`void`

***

### update()?

> `optional` **update**(`meta`): `void`

Defined in: packages/renderer-dom/dist/widgets.d.ts:58

Optional: Update the widget when tile metadata changes

#### Parameters

##### meta

`Record`\<`string`, `unknown`\>

#### Returns

`void`
