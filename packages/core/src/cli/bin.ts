#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import { dev } from './dev';
import { type ExportFormat, exportReport } from './export';

const program = new Command();

program.name('open-report').description('Runtime CLI for open-report projects');

program
  .command('dev')
  .description('Start the dev server with live paged preview')
  .option('--port <port>', 'dev server port', '5173')
  .action(async (options: { port: string }) => {
    await dev({ port: Number(options.port) });
  });

program
  .command('export')
  .description('Export the report as PDF / static HTML')
  .argument('<report-id>')
  .option('--format <format>', 'pdf | html', 'pdf')
  .option('--out <path>', 'output file path (default: <report-id>.<format>)')
  .action(
    async (
      reportId: string,
      options: { format: ExportFormat; out?: string },
    ) => {
      try {
        process.stdout.write(
          `${chalk.dim('rendering')} ${reportId} → ${options.format}…\n`,
        );
        const out = await exportReport(reportId, {
          format: options.format,
          out: options.out,
        });
        process.stdout.write(`${chalk.green('✔')} exported ${out}\n`);
        process.exit(0);
      } catch (error) {
        process.stderr.write(`${chalk.red('✖')} ${(error as Error).message}\n`);
        process.exit(1);
      }
    },
  );

program.parse();
