#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './create.js';

const program = new Command();

program
  .name('create-rapidkit')
  .description('Create a new RapidKit project')
  .version('0.1.0', '-v, --version', 'Output the current version')
  .argument('[project-name]', 'Project name')
  .option('-f, --framework <framework>', 'Framework to use (fastapi or nestjs)')
  .option('-m, --modules <modules...>', 'Modules to include')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-git', 'Skip git initialization')
  .action(async (projectName: string, options: any) => {
    console.log(chalk.cyan.bold('\n🚀 Welcome to RapidKit!\n'));
    
    try {
      await createProject(projectName, options);
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
