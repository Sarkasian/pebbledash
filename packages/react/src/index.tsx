import { useEffect, useRef } from 'react';
import type { DashboardModel } from '@pebbledash/core';
import type { DomRenderer, WidgetRegistry } from '@pebbledash/renderer-dom';

export interface DashboardProps {
  model: DashboardModel;
  className?: string;
  style?: React.CSSProperties;
  /** Registry of widget factories keyed by widget type */
  widgets?: WidgetRegistry;
}

export function Dashboard({ model, className, style, widgets }: DashboardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetsRef = useRef(widgets);

  // Keep widgets ref updated for stable reference in effect
  useEffect(() => {
    widgetsRef.current = widgets;
  }, [widgets]);

  useEffect(() => {
    if (!ref.current) return;
    let disposed = false;
    let renderer: DomRenderer | undefined;
    (async () => {
      const { DomRenderer: RendererClass } = await import('@pebbledash/renderer-dom');
      if (disposed) return;
      renderer = new RendererClass({
        container: ref.current!,
        widgets: widgetsRef.current,
      });
      renderer.mount(model);
    })();
    return () => {
      disposed = true;
      renderer?.unmount();
    };
  }, [model]);

  const mergedStyle = { width: '100%', height: '100%', ...(style || {}) } as React.CSSProperties;
  return <div ref={ref} className={className} style={mergedStyle} />;
}

// Re-export widget types for convenience
export type {
  Widget,
  WidgetFactory,
  WidgetRegistry,
  WidgetContext,
} from '@pebbledash/renderer-dom';
