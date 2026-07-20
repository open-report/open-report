import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import remarkFrontmatter from 'remark-frontmatter';
import { createServer, searchForWorkspaceRoot } from 'vite';
import { appDir, openReport } from '../vite/index';

export async function dev(options: { port?: number } = {}) {
  const root = process.cwd();
  const server = await createServer({
    root,
    configFile: false,
    appType: 'custom',
    plugins: [
      { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter] }) },
      react(),
      openReport(),
    ],
    server: {
      port: options.port ?? 5173,
      fs: {
        allow: [searchForWorkspaceRoot(root), root, appDir],
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom/client', 'react-dom/server'],
    },
  });
  await server.listen();
  server.printUrls();
}
