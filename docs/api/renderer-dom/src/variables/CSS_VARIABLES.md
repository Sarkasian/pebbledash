[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / CSS\_VARIABLES

# Variable: CSS\_VARIABLES

> `const` **CSS\_VARIABLES**: "\n  /\* Background colors \*/\n  --ud-bg: #ffffff;\n  --ud-tile-bg: #f8f8f8;\n  --ud-tile-bg-hover: #f0f0f0;\n  \n  /\* Border colors \*/\n  --ud-border-color: #e0e0e0;\n  --ud-border-color-focus: var(--ud-accent-color, #005fcc);\n  \n  /\* Text colors \*/\n  --ud-text-color: #1a1a1a;\n  --ud-text-muted: #666666;\n  \n  /\* Interactive colors \*/\n  --ud-accent-color: #005fcc;\n  --ud-accent-color-hover: #0047a3;\n  --ud-focus-color: var(--ud-accent-color, #005fcc);\n  --ud-focus-offset: -3px;\n  \n  /\* Overlay colors \*/\n  --ud-overlay-bg: rgba(0, 0, 0, 0.05);\n  --ud-resize-handle-color: var(--ud-accent-color, #005fcc);\n  \n  /\* Config preview colors \*/\n  --ud-preview-affected-bg: rgba(255, 100, 100, 0.2);\n  --ud-preview-affected-border: #ff4444;\n  --ud-preview-compliant: #4CAF50;\n  --ud-preview-violating: #f44336;\n  --ud-preview-indicator-bg: #ff4444;\n  --ud-preview-indicator-color: white;\n  \n  /\* Spacing \*/\n  --ud-tile-gap: 0px;\n  --ud-tile-padding: 0px;\n  --ud-tile-border-radius: 0px;\n  --ud-overlay-padding: 4px;\n  \n  /\* Animation \*/\n  --ud-transition-duration: 200ms;\n  --ud-transition-easing: ease-out;\n  \n  /\* Shadows \*/\n  --ud-tile-shadow: none;\n  --ud-tile-shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.1);\n\n  /\* Edge overlay \*/\n  --ud-edge-width: 8px;\n  --ud-edge-color: transparent;\n  --ud-edge-color-hover: var(--ud-accent-color, #005fcc);\n  --ud-edge-color-disabled: #999999;\n"

Defined in: [packages/renderer-dom/src/styles.ts:6](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/styles.ts#L6)

CSS custom property definitions for theming pebbledash dashboards.
Consumers can override these by setting CSS variables on the .ud-root element.
