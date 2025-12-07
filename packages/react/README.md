# @pebbledash/react

React wrapper for `@pebbledash/core` using the DOM renderer.

```tsx
import { useMemo } from 'react';
import { DashboardModel } from '@pebbledash/core';
import { Dashboard } from '@pebbledash/react';

export function App() {
  const model = useMemo(() => {
    const m = new DashboardModel();
    m.initialize();
    return m;
  }, []);
  return <Dashboard model={model} />;
}
```
