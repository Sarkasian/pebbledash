# @pebbledash/web-component

Custom element `<ud-dashboard>` wrapping the DOM renderer.

```html
<ud-dashboard id="dash"></ud-dashboard>
<script type="module">
  import '@pebbledash/web-component';
  import { DashboardModel } from '@pebbledash/core';
  const model = new DashboardModel();
  await model.initialize();
  (document.getElementById('dash') as any).model = model;
</script>
```
