#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './create.js';
import { generateDemoKit } from './demo-kit.js';
import inquirer from 'inquirer';
import path from 'path';

const program = new Command();

program
  .name('create-rapidkit')
  .description('Create a RapidKit development environment or workspace')
  .version('1.0.0-beta.2')
  .argument('[directory-name]', 'Name of the workspace or project directory')
  .option('--skip-git', 'Skip git initialization')
  .option('--test-mode', 'Install RapidKit from local path (for testing only)')
  .option('--demo', 'Create workspace with demo kit templates (no Python installation required)')
  .option('--demo-only', 'Generate a demo project in current directory (used by demo workspace)')
  .action(async (directoryName, options) => {
    try {
      console.log(chalk.blue.bold('\n🚀 Welcome to create-rapidkit!\n'));

      // Demo-only mode - generate project directly without workspace
      if (options.demoOnly) {
        const projectName = directoryName || 'my-fastapi-project';
        const projectPath = path.resolve(process.cwd(), projectName);

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'project_name',
            message: 'Project name (snake_case):',
            default: projectName.replace(/-/g, '_'),
            validate: (input) => {
              if (!/^[a-z][a-z0-9_]*$/.test(input)) {
                return 'Please use snake_case (lowercase with underscores)';
              }
              return true;
            },
          },
          {
            type: 'input',
            name: 'author',
            message: 'Author name:',
            default: process.env.USER || 'RapidKit User',
          },
          {
            type: 'input',
            name: 'description',
            message: 'Project description:',
            default: 'FastAPI service generated with RapidKit',
          },
        ]);

        await generateDemoKit(projectPath, answers);
        return;
      }

      const workspaceName = directoryName || 'rapidkit-workspace';

      if (options.demo) {
        // Demo mode - create workspace with demo capabilities
        console.log(
          chalk.gray(
            'This will create a workspace with demo kit templates.\nYou can generate demo projects inside without installing Python RapidKit.\n'
          )
        );

        await createProject(workspaceName, {
          skipGit: options.skipGit,
          testMode: false,
          demoMode: true,
        });
        return;
      }

      // Normal mode - full RapidKit installation
      console.log(
        chalk.yellow.bold('⚠️  BETA NOTICE\n')
      );
      console.log(
        chalk.yellow(
          'RapidKit Python package is not yet available on PyPI.\n' +
          'Full installation mode will be available soon.\n'
        )
      );
      console.log(
        chalk.cyan('For now, please use one of these options:\n')
      );
      console.log(chalk.white('  1. Demo mode (recommended):'));
      console.log(chalk.gray('     npx create-rapidkit my-workspace --demo\n'));
      console.log(chalk.white('  2. Test mode (if you have local RapidKit):'));
      console.log(chalk.gray('     npx create-rapidkit my-workspace --test-mode\n'));

      if (!options.testMode) {
        console.log(chalk.red('❌ Cannot proceed without --demo or --test-mode flag.\n'));
        process.exit(1);
      }

      console.log(chalk.yellow('⚠️  Running in TEST MODE - Installing from local path\n'));

      await createProject(workspaceName, {
        skipGit: options.skipGit,
        testMode: options.testMode,
        demoMode: false,
      });
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to create RapidKit environment:'), error);
      process.exit(1);
    }
  });

program.parse();
