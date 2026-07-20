#!/usr/bin/env node
import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { Command } from 'commander';

const templateDir = fileURLToPath(new URL('../template', import.meta.url));

const program = new Command();

program
  .name('open-report-cli')
  .command('init', { isDefault: true })
  .argument('<project-name>')
  .description('Scaffold a new open-report project')
  .action(async (projectName: string) => {
    const target = join(process.cwd(), projectName);
    await mkdir(target, { recursive: false });
    await cp(templateDir, target, { recursive: true });
    process.stdout.write(
      [
        `${chalk.green('✔')} Created ${projectName}`,
        '',
        `  cd ${projectName}`,
        '  pnpm install',
        '  pnpm dev',
        '',
        'Then ask your coding agent to draft a report with the create-report skill.',
        '',
      ].join('\n'),
    );
  });

program.parse();
