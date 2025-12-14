# Widget Development Guide

This guide explains how to create custom widgets for pebbledash dashboards.

## Overview

Widgets are the building blocks that render content within dashboard tiles. Each widget is responsible for:

1. Mounting content into a tile's content element
2. Handling cleanup when unmounted
3. Optionally responding to metadata updates

## Widget Interface

A widget must implement the `Widget` interface:

```typescript
interface Widget {
  /** Called to render the widget into the tile */
  mount(): void | Promise<void>;
  
  /** Called to clean up when the tile is removed */
  unmount(): void;
  
  /** Optional: Called when tile metadata changes */
  update?(newMeta: Record<string, unknown>): void | Promise<void>;
}
```

## Widget Factory

Widgets are created via factory functions that receive context:

```typescript
type WidgetFactory = (ctx: WidgetContext) => Widget;

interface WidgetContext {
  /** Unique tile identifier */
  tileId: string;
  
  /** Tile metadata (contentRef, custom properties, etc.) */
  meta: Record<string, unknown>;
  
  /** DOM element to render content into */
  element: HTMLElement;
  
  /** Parent tile element (for overlays) */
  tileElement: HTMLElement;
  
  /** Register a callback for when the tile resizes */
  onResize: (callback: () => void) => () => void;
  
  /** Register a callback for tile clicks */
  onClick: (handler: (event: MouseEvent) => void) => () => void;
  
  /** Register a callback for hover enter/leave */
  onHover: (handler: (entering: boolean) => void) => () => void;
  
  /** Add an overlay element to the tile */
  addOverlay: (element: HTMLElement, position?: OverlayPosition) => () => void;
  
  /** Add a header element to the tile */
  addHeader: (element: HTMLElement) => () => void;
}

type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
```

## Creating a Simple Widget

Here's a minimal widget that displays text:

```typescript
import type { WidgetContext, Widget } from '@pebbledash/renderer-dom';

function createTextWidget(ctx: WidgetContext): Widget {
  return {
    mount() {
      const text = ctx.meta.text as string || 'Hello, World!';
      ctx.element.textContent = text;
    },
    
    unmount() {
      ctx.element.textContent = '';
    },
    
    update(newMeta) {
      const text = newMeta.text as string || 'Hello, World!';
      ctx.element.textContent = text;
    },
  };
}
```

## Registering Widgets

Register widgets when creating a dashboard:

```typescript
import { BaseDashboard } from '@pebbledash/renderer-dom';

const dashboard = new BaseDashboard({
  container: document.getElementById('dashboard'),
  widgets: {
    text: createTextWidget,
    image: createImageWidget,
    default: createPlaceholderWidget,
  },
  // ... other options
});
```

The widget type is determined by `tile.meta.widgetType`. If not specified, the `default` widget is used.

## Advanced Widget Features

### Using Resize Callbacks

Respond to tile size changes:

```typescript
function createChartWidget(ctx: WidgetContext): Widget {
  let chart: Chart | null = null;
  let unsubscribe: (() => void) | null = null;

  return {
    mount() {
      chart = new Chart(ctx.element, { /* ... */ });
      
      // Re-render on resize
      unsubscribe = ctx.onResize(() => {
        chart?.resize();
      });
    },
    
    unmount() {
      unsubscribe?.();
      chart?.destroy();
      chart = null;
    },
  };
}
```

### Adding Overlays

Add buttons or controls that float above the content:

```typescript
function createVideoWidget(ctx: WidgetContext): Widget {
  let video: HTMLVideoElement | null = null;
  let removePlayButton: (() => void) | null = null;

  return {
    mount() {
      video = document.createElement('video');
      video.src = ctx.meta.src as string;
      ctx.element.appendChild(video);
      
      // Add a play button overlay
      const playBtn = document.createElement('button');
      playBtn.textContent = '▶';
      playBtn.onclick = () => video?.play();
      
      removePlayButton = ctx.addOverlay(playBtn, 'center');
    },
    
    unmount() {
      removePlayButton?.();
      video?.remove();
      video = null;
    },
  };
}
```

### Adding Headers

Add a title bar to the tile:

```typescript
function createDocumentWidget(ctx: WidgetContext): Widget {
  let removeHeader: (() => void) | null = null;

  return {
    mount() {
      // Create header
      const header = document.createElement('div');
      header.className = 'widget-header';
      header.textContent = ctx.meta.title as string || 'Document';
      
      removeHeader = ctx.addHeader(header);
      
      // Render content
      ctx.element.innerHTML = ctx.meta.content as string || '';
    },
    
    unmount() {
      removeHeader?.();
      ctx.element.innerHTML = '';
    },
  };
}
```

### Handling Click Events

Add click interactivity:

```typescript
function createCounterWidget(ctx: WidgetContext): Widget {
  let count = 0;
  let unsubscribeClick: (() => void) | null = null;

  function render() {
    ctx.element.textContent = `Count: ${count}`;
  }

  return {
    mount() {
      render();
      
      unsubscribeClick = ctx.onClick(() => {
        count++;
        render();
      });
    },
    
    unmount() {
      unsubscribeClick?.();
      ctx.element.textContent = '';
    },
  };
}
```

### Hover Effects

Respond to hover state:

```typescript
function createRevealWidget(ctx: WidgetContext): Widget {
  let unsubscribeHover: (() => void) | null = null;

  return {
    mount() {
      ctx.element.innerHTML = '<div class="hidden-content">Secret!</div>';
      
      unsubscribeHover = ctx.onHover((entering) => {
        ctx.element.classList.toggle('revealed', entering);
      });
    },
    
    unmount() {
      unsubscribeHover?.();
      ctx.element.innerHTML = '';
    },
  };
}
```

## Widget Metadata Schema

Define expected metadata for your widget:

```typescript
interface ImageWidgetMeta {
  widgetType: 'image';
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

function createImageWidget(ctx: WidgetContext): Widget {
  const meta = ctx.meta as ImageWidgetMeta;
  
  return {
    mount() {
      const img = document.createElement('img');
      img.src = meta.src;
      img.alt = meta.alt || '';
      img.style.objectFit = meta.objectFit || 'cover';
      img.style.width = '100%';
      img.style.height = '100%';
      ctx.element.appendChild(img);
    },
    
    unmount() {
      ctx.element.innerHTML = '';
    },
    
    update(newMeta) {
      const img = ctx.element.querySelector('img');
      if (img && newMeta.src) {
        img.src = newMeta.src as string;
      }
    },
  };
}
```

## Async Widget Loading

Widgets can be asynchronous:

```typescript
function createAsyncWidget(ctx: WidgetContext): Widget {
  let content: HTMLElement | null = null;

  return {
    async mount() {
      ctx.element.textContent = 'Loading...';
      
      const data = await fetchData(ctx.meta.dataUrl as string);
      
      content = document.createElement('div');
      content.textContent = data;
      
      ctx.element.textContent = '';
      ctx.element.appendChild(content);
    },
    
    unmount() {
      content?.remove();
      content = null;
    },
  };
}
```

## Error Handling

Handle errors gracefully:

```typescript
function createSafeWidget(ctx: WidgetContext): Widget {
  return {
    mount() {
      try {
        // Widget initialization
        const data = JSON.parse(ctx.meta.data as string);
        ctx.element.textContent = data.message;
      } catch (error) {
        ctx.element.innerHTML = `
          <div class="widget-error">
            <span>⚠️ Failed to load widget</span>
            <small>${error instanceof Error ? error.message : 'Unknown error'}</small>
          </div>
        `;
      }
    },
    
    unmount() {
      ctx.element.innerHTML = '';
    },
  };
}
```

## Testing Widgets

Test widgets in isolation:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TextWidget', () => {
  let container: HTMLElement;
  let widget: Widget;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    widget?.unmount();
    container.remove();
  });

  it('renders text from meta', () => {
    const ctx: WidgetContext = {
      tileId: 'test-1',
      meta: { text: 'Hello!' },
      element: container,
      tileElement: container,
      onResize: () => () => {},
      onClick: () => () => {},
      onHover: () => () => {},
      addOverlay: () => () => {},
      addHeader: () => () => {},
    };

    widget = createTextWidget(ctx);
    widget.mount();

    expect(container.textContent).toBe('Hello!');
  });

  it('updates text on meta change', () => {
    const ctx = createMockContext({ text: 'Initial' });
    widget = createTextWidget(ctx);
    widget.mount();

    widget.update?.({ text: 'Updated' });

    expect(ctx.element.textContent).toBe('Updated');
  });
});
```

## Best Practices

### 1. Clean Up Everything

Always clean up in `unmount()`:

```typescript
unmount() {
  // Remove event listeners
  this.unsubscribeResize?.();
  
  // Clear intervals/timeouts
  clearInterval(this.updateInterval);
  
  // Destroy libraries
  this.chart?.destroy();
  
  // Clear DOM
  ctx.element.innerHTML = '';
}
```

### 2. Use `update()` for Efficient Changes

Instead of remounting, update in place:

```typescript
update(newMeta) {
  // Only update changed properties
  if (newMeta.title !== this.currentTitle) {
    this.titleEl.textContent = newMeta.title as string;
    this.currentTitle = newMeta.title as string;
  }
}
```

### 3. Handle Missing Data

Always provide fallbacks:

```typescript
mount() {
  const src = ctx.meta.src as string;
  if (!src) {
    ctx.element.innerHTML = '<div class="placeholder">No source provided</div>';
    return;
  }
  // ... normal rendering
}
```

### 4. Respect Container Bounds

Don't break out of the container:

```typescript
mount() {
  ctx.element.style.overflow = 'hidden';
  // Content that might overflow...
}
```

### 5. Make Widgets Accessible

Add ARIA attributes:

```typescript
mount() {
  ctx.element.setAttribute('role', 'img');
  ctx.element.setAttribute('aria-label', ctx.meta.alt as string || 'Image');
}
```

## Framework Integration

### React Widgets

Use `createRoot` for React components:

```typescript
import { createRoot, Root } from 'react-dom/client';

function createReactWidget(ctx: WidgetContext): Widget {
  let root: Root | null = null;

  return {
    mount() {
      root = createRoot(ctx.element);
      root.render(<MyComponent data={ctx.meta} />);
    },
    
    unmount() {
      root?.unmount();
      root = null;
    },
    
    update(newMeta) {
      root?.render(<MyComponent data={newMeta} />);
    },
  };
}
```

### Vue Widgets

Mount Vue components:

```typescript
import { createApp, App } from 'vue';
import MyComponent from './MyComponent.vue';

function createVueWidget(ctx: WidgetContext): Widget {
  let app: App | null = null;

  return {
    mount() {
      app = createApp(MyComponent, { data: ctx.meta });
      app.mount(ctx.element);
    },
    
    unmount() {
      app?.unmount();
      app = null;
    },
  };
}
```

## Example: Markdown Widget

A complete example of a markdown rendering widget:

```typescript
import { marked } from 'marked';
import type { WidgetContext, Widget } from '@pebbledash/renderer-dom';

interface MarkdownWidgetMeta {
  widgetType: 'markdown';
  content: string;
  sanitize?: boolean;
}

export function createMarkdownWidget(ctx: WidgetContext): Widget {
  const meta = ctx.meta as MarkdownWidgetMeta;
  let unsubscribeResize: (() => void) | null = null;

  function render(content: string) {
    const html = marked.parse(content);
    ctx.element.innerHTML = meta.sanitize !== false 
      ? sanitizeHtml(html) 
      : html;
  }

  return {
    mount() {
      ctx.element.className = 'markdown-widget';
      render(meta.content || '');
      
      // Re-render on resize to handle responsive images
      unsubscribeResize = ctx.onResize(() => {
        const images = ctx.element.querySelectorAll('img');
        images.forEach(img => img.style.maxWidth = '100%');
      });
    },
    
    unmount() {
      unsubscribeResize?.();
      ctx.element.innerHTML = '';
      ctx.element.className = '';
    },
    
    update(newMeta) {
      if (newMeta.content) {
        render(newMeta.content as string);
      }
    },
  };
}
```

## Further Reading

- [Architecture Overview](./architecture.md) - Understanding the core library
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [API Reference](./api/) - Complete API documentation

