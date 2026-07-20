import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const MAC_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
];

const LINUX_PATHS = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  '/usr/bin/microsoft-edge',
];

const LINUX_BINARIES = [
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
];

function which(binary: string): string | undefined {
  try {
    const found = execSync(`command -v ${binary}`, {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    return found || undefined;
  } catch {
    return undefined;
  }
}

function candidates(): string[] {
  if (process.platform === 'darwin') return MAC_PATHS;
  if (process.platform === 'win32') {
    const bases = [
      process.env.PROGRAMFILES,
      process.env['PROGRAMFILES(X86)'],
      process.env.LOCALAPPDATA,
    ].filter(Boolean) as string[];
    return bases.flatMap((base) => [
      `${base}\\Google\\Chrome\\Application\\chrome.exe`,
      `${base}\\Microsoft\\Edge\\Application\\msedge.exe`,
    ]);
  }
  return [
    ...LINUX_PATHS,
    ...LINUX_BINARIES.map(which).filter((p): p is string => Boolean(p)),
  ];
}

/**
 * Locate a system Chrome/Chromium executable to drive with puppeteer-core.
 * open-report does not bundle a browser — it reuses the one already installed.
 * Throws a message with next steps when nothing is found.
 */
export function findChrome(): string {
  const override =
    process.env.PUPPETEER_EXECUTABLE_PATH ?? process.env.CHROME_PATH;
  if (override) {
    if (existsSync(override)) return override;
    throw new Error(
      `CHROME_PATH/PUPPETEER_EXECUTABLE_PATH points to "${override}", which does not exist.`,
    );
  }
  for (const path of candidates()) {
    if (existsSync(path)) return path;
  }
  throw new Error(
    [
      'Could not find a system Chrome/Chromium to render the export.',
      'open-report does not bundle a browser; install Google Chrome from',
      'https://www.google.com/chrome/ (or Chromium/Edge), then re-run.',
      'If it is installed in a non-standard location, set CHROME_PATH to the',
      'executable, e.g. CHROME_PATH="/path/to/chrome" open-report export <id>.',
    ].join('\n'),
  );
}
