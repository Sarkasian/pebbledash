# @pebbledash/renderer-dom

Vanilla DOM renderer for `@pebbledash/core`.

```ts
import { DashboardModel } from '@pebbledash/core';
import { DomRenderer } from '@pebbledash/renderer-dom';

const model = new DashboardModel();
await model.initialize();
const renderer = new DomRenderer({ container: document.getElementById('dash')! });
renderer.mount(model);
```

## BaseDashboard (drop-in)

```ts
import { BaseDashboard } from '@pebbledash/renderer-dom';

const dash = new BaseDashboard({
  container: '#dash',
  defaults: { minTile: { width: 5, height: 5 }, epsilon: 1e-6 },
  features: { overlays: true, keyboard: true, startMode: 'insert' },
});
await dash.mount();
```
