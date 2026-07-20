import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import remarkFrontmatter from 'remark-frontmatter';
import {
  createServer,
  type LogLevel,
  searchForWorkspaceRoot,
  type ViteDevServer,
} from 'vite';
import { appDir, openReport } from '../vite/index';

export type ReportServer = {
  server: ViteDevServer;
  port: number;
  url: string;
};

/**
 * Start the open-report Vite dev server (shared by `dev` and `export`).
 * Pass `port: 0` for an OS-assigned free port; the resolved port is returned.
 */
export async function startReportServer(
  options: { root?: string; port?: number; logLevel?: LogLevel } = {},
): Promise<ReportServer> {
  const root = options.root ?? process.cwd();
  const server = await createServer({
    root,
    configFile: false,
    appType: 'custom',
    logLevel: options.logLevel ?? 'info',
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
  const address = server.httpServer?.address();
  const port =
    address && typeof address === 'object'
      ? address.port
      : (options.port ?? 5173);
  return { server, port, url: `http://localhost:${port}` };
}
