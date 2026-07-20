import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import type { Plugin } from 'vite';
import { parseFrontmatter } from './frontmatter';

const VIRTUAL_REPORTS = 'virtual:open-report/reports';
const RESOLVED_REPORTS = `\0${VIRTUAL_REPORTS}`;

function findPackageRoot(from: string): string {
  let dir = dirname(from);
  while (true) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
          name?: string;
        };
        if (pkg.name === '@open-report/core') return dir;
      } catch {
        // keep walking up
      }
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(
        'open-report: cannot locate the @open-report/core package root',
      );
    }
    dir = parent;
  }
}

export const appDir = join(
  findPackageRoot(fileURLToPath(import.meta.url)),
  'src',
  'app',
);

const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>open-report</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/@fs${appDir}/main.tsx"></script>
  </body>
</html>
`;

export function openReport(): Plugin {
  let root = '';
  return {
    name: 'open-report',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_REPORTS) return RESOLVED_REPORTS;
    },
    load(id) {
      if (id !== RESOLVED_REPORTS) return;
      const files = fg.sync('reports/*/index.mdx', {
        cwd: root,
        absolute: true,
      });
      const entries = files.map((file) => {
        const dir = file.slice(0, -'/index.mdx'.length);
        const reportId = dir.split('/').pop() ?? dir;
        const meta = parseFrontmatter(readFileSync(file, 'utf8'));
        return [
          '  {',
          `    id: ${JSON.stringify(reportId)},`,
          `    dir: ${JSON.stringify(`/@fs${dir}`)},`,
          `    meta: ${JSON.stringify(meta)},`,
          `    load: () => import(${JSON.stringify(`/@fs${file}`)}),`,
          '  }',
        ].join('\n');
      });
      return `export const reports = [\n${entries.join(',\n')}\n];\n`;
    },
    configureServer(server) {
      const invalidate = (file: string) => {
        if (!file.endsWith('index.mdx')) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_REPORTS);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', invalidate);
      server.watcher.on('unlink', invalidate);
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url?.split('?')[0];
          const wantsHtml = req.headers.accept?.includes('text/html');
          if (url === '/' || (wantsHtml && url && !url.includes('.'))) {
            const html = await server.transformIndexHtml(
              req.url ?? '/',
              indexHtml,
            );
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
          }
          next();
        });
      };
    },
  };
}
