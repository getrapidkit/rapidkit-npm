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
  .description('Create a RapidKit development environment with Python virtual environment')
  .version('1.0.0-beta.1')
  .argument('[directory-name]', 'Name of the directory to create (default: rapidkit)')
  .option('--skip-git', 'Skip git initialization')
  .option('--test-mode', 'Install RapidKit from local path (for testing only)')
  .option('--demo', 'Generate a standalone FastAPI demo project without Python RapidKit')
  .action(async (directoryName, options) => {
    try {
      console.log(chalk.blue.bold('\n🚀 Welcome to create-rapidkit!\n'));

      if (options.demo) {
        // Demo mode - generate standalone project
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

      // Normal mode - full RapidKit installation
      console.log(
        chalk.gray(
          'This tool will set up a Python environment with RapidKit installed,\nso you can use rapidkit commands to create and manage your projects.\n'
        )
      );

      if (options.testMode) {
        console.log(chalk.yellow('⚠️  Running in TEST MODE - Installing from local path\n'));
      }

      await createProject(directoryName, {
        skipGit: options.skipGit,
        testMode: options.testMode,
      });
    } catch (error) {
      console.error(chalk.red('\n❌ Failed to create RapidKit environment:'), error);
      process.exit(1);
    }
  });

program.parse();
