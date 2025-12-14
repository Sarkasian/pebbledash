[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / RedistributeConfig

# Interface: RedistributeConfig

Defined in: packages/renderer-dom/src/resizeTypes.ts:37

Configuration for redistribute mode (Shift + drag)

## Properties

### enabled?

> `optional` **enabled**: `boolean`

Defined in: packages/renderer-dom/src/resizeTypes.ts:39

Enable redistribute mode (default: true)

***

### minHeight?

> `optional` **minHeight**: `number`

Defined in: packages/renderer-dom/src/resizeTypes.ts:43

Minimum tile height as percentage (default: 10)

***

### minWidth?

> `optional` **minWidth**: `number`

Defined in: packages/renderer-dom/src/resizeTypes.ts:41

Minimum tile width as percentage (default: 10)

***

### redistributeEqually?

> `optional` **redistributeEqually**: `boolean`

Defined in: packages/renderer-dom/src/resizeTypes.ts:45

If true, tiles in shrink chain resize proportionally. If false, first tile shrinks to min before next starts.
