export interface InstrumentationAdapter {
  // minimal placeholder to match core API expectation
  onDecisionSpan(_span: unknown): void;
  onStateSample(_sample: unknown): void;
}

export interface ConsoleAdapterOptions {
  /** Enable logging output. Defaults to true in development, false in production. */
  enabled?: boolean;
}

export function createConsoleAdapter(options?: ConsoleAdapterOptions): InstrumentationAdapter {
  const enabled = options?.enabled ?? process.env.NODE_ENV !== 'production';

  return {
    onDecisionSpan(span) {
      if (enabled) {
        console.log('[devtools] span', span);
      }
    },
    onStateSample(sample) {
      if (enabled) {
        console.log('[devtools] sample', sample);
      }
    },
  };
}
