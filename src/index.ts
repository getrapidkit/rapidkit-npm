#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './create.js';

const program = new Command();

program
  .name('create-rapidkit')
  .description('Create a RapidKit development environment with Python virtual environment')
  .version('0.1.0')
  .argument('[directory-name]', 'Name of the directory to create (default: rapidkit)')
  .option('--skip-git', 'Skip git initialization')
  .action(async (directoryName, options) => {
    try {
      console.log(chalk.blue.bold('\n🚀 Welcome to create-rapidkit!\n'));
      console.log(
        chalk.gray(
          'This tool will set up a Python environment with RapidKit installed,\nso you can use rapidkit commands to create and manage your projects.\n'
        )
      );

      await createProject(directoryName, {
        skipGit: options.skipGit,
      });
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to create RapidKit environment:'), error);
      process.exit(1);
    }
  });

program.parse();
