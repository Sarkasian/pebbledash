[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / Widget

# Interface: Widget

Defined in: [packages/renderer-dom/src/widgets.ts:54](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L54)

Interface for widgets rendered inside dashboard tiles.

## Methods

### mount()

> **mount**(): `void`

Defined in: [packages/renderer-dom/src/widgets.ts:56](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L56)

Mount the widget and render its initial content

#### Returns

`void`

***

### unmount()

> **unmount**(): `void`

Defined in: [packages/renderer-dom/src/widgets.ts:58](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L58)

Cleanup and remove the widget

#### Returns

`void`

***

### update()?

> `optional` **update**(`meta`): `void`

Defined in: [packages/renderer-dom/src/widgets.ts:60](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/widgets.ts#L60)

Optional: Update the widget when tile metadata changes

#### Parameters

##### meta

`Record`\<`string`, `unknown`\>

#### Returns

`void`
