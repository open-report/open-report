import { startReportServer } from './server';

export async function dev(options: { port?: number } = {}) {
  const { server } = await startReportServer({ port: options.port ?? 5173 });
  server.printUrls();
}
