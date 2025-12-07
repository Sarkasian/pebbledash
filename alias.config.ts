import path from 'node:path';

const root = path.resolve(__dirname);

export const workspaceAliases = [
  {
    find: '@pebbledash/core/internal',
    replacement: path.resolve(root, 'packages/core/src/internal.ts'),
  },
  { find: '@pebbledash/core', replacement: path.resolve(root, 'packages/core/src/index.ts') },
  {
    find: '@pebbledash/renderer-dom',
    replacement: path.resolve(root, 'packages/renderer-dom/src/index.ts'),
  },
  {
    find: '@pebbledash/web-component',
    replacement: path.resolve(root, 'packages/web-component/src/index.ts'),
  },
  { find: '@pebbledash/react', replacement: path.resolve(root, 'packages/react/src/index.tsx') },
] as const;

export default workspaceAliases;
