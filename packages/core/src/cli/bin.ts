#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';

const program = new Command();

program.name('open-report').description('Runtime CLI for open-report projects');

program
  .command('dev')
  .description('Start the dev server with live paged preview')
  .action(() => {
    process.stdout.write(
      `${chalk.yellow('open-report dev')} — not implemented yet\n`,
    );
  });

program
  .command('export')
  .description('Export the report as PDF / static HTML')
  .argument('<report-id>')
  .option('--format <format>', 'pdf | html', 'pdf')
  .action((reportId: string) => {
    process.stdout.write(
      `${chalk.yellow('open-report export')} ${reportId} — not implemented yet\n`,
    );
  });

program.parse();
