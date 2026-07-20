import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import fg from 'fast-glob';
import puppeteer from 'puppeteer-core';
import { findChrome } from './chrome';
import { startReportServer } from './server';

export type ExportFormat = 'pdf' | 'html';

export type ExportOptions = {
  format?: ExportFormat;
  out?: string;
  root?: string;
};

function listReportIds(root: string): string[] {
  return fg
    .sync('reports/*/index.mdx', { cwd: root })
    .map((file) => file.split('/').slice(-2)[0] as string);
}

/** Inline images as data URIs and strip scripts so the HTML opens offline. */
async function serializeStandalone(page: import('puppeteer-core').Page) {
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map(async (img) => {
        try {
          const res = await fetch(img.src);
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((r) => {
            const reader = new FileReader();
            reader.onload = () => r(String(reader.result));
            reader.readAsDataURL(blob);
          });
          img.setAttribute('src', dataUrl);
        } catch {
          // leave the original src if it cannot be fetched
        }
      }),
    );
    for (const script of Array.from(document.querySelectorAll('script'))) {
      script.remove();
    }
    // Drop dev-server links (preload hints, dev stylesheets) that point at the
    // server; CSS is already inlined as <style>, so nothing external is needed.
    for (const link of Array.from(document.querySelectorAll('link'))) {
      const href = link.getAttribute('href') ?? '';
      const rel = link.getAttribute('rel') ?? '';
      if (
        rel === 'preload' ||
        rel === 'modulepreload' ||
        href.startsWith('/') ||
        href.startsWith('http')
      ) {
        link.remove();
      }
    }
  });
  return page.content();
}

/**
 * Render a report with headless system Chrome and write it to PDF or a
 * self-contained HTML file. Returns the absolute output path.
 */
export async function exportReport(
  reportId: string,
  options: ExportOptions = {},
): Promise<string> {
  const format = options.format ?? 'pdf';
  if (format !== 'pdf' && format !== 'html') {
    throw new Error(`Unknown format "${format}". Use "pdf" or "html".`);
  }
  const root = options.root ?? process.cwd();

  const ids = listReportIds(root);
  if (!ids.includes(reportId)) {
    const available = ids.length
      ? ids.join(', ')
      : '(none found under reports/)';
    throw new Error(`Report "${reportId}" not found. Available: ${available}`);
  }

  const outPath = resolve(root, options.out ?? `${reportId}.${format}`);
  const executablePath = findChrome();

  const { server, port } = await startReportServer({
    root,
    port: 0,
    logLevel: 'silent',
  });
  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox'],
    });
    try {
      const page = await browser.newPage();
      const url = `http://localhost:${port}/#/export/${encodeURIComponent(reportId)}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('body[data-or-ready="true"]', {
        timeout: 60000,
      });

      if (format === 'pdf') {
        await page.pdf({
          path: outPath,
          preferCSSPageSize: true,
          printBackground: true,
        });
      } else {
        writeFileSync(outPath, await serializeStandalone(page), 'utf8');
      }
    } finally {
      await browser.close();
    }
  } finally {
    await server.close();
  }
  return outPath;
}
