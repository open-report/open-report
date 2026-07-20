import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'vite/index': 'src/vite/index.ts',
    'cli/bin': 'src/cli/bin.ts',
  },
  format: 'esm',
  dts: true,
  clean: true,
});
