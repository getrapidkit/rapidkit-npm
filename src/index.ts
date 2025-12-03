#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { logger } from './logger.js';
import { checkForUpdates, getVersion } from './update-checker.js';
import { loadUserConfig } from './config.js';
import { validateProjectName } from './validation.js';
import { RapidKitError } from './errors.js';
import * as fsExtra from 'fs-extra';
import { createWorkspace, createProject } from './workspace.js';

// Track current project path for cleanup on interrupt
let currentProjectPath: string | null = null;
let cleanupInProgress = false;

const program = new Command();

program
  .name('rapidkit')
  .description('Create RapidKit workspaces and projects')
  .version(getVersion());

// Main command: npx rapidkit <name>
program
  .argument('[name]', 'Name of the workspace or project directory')
  .option(
    '-t, --template <template>',
    'Create project with template (fastapi, nestjs) instead of workspace'
  )
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--skip-git', 'Skip git initialization')
  .option('--skip-install', 'Skip installing dependencies')
  .option('--debug', 'Enable debug logging')
  .option('--dry-run', 'Show what would be created without creating it')
  .option('--no-update-check', 'Skip checking for updates')
  .action(async (name, options) => {
    try {
      // Enable debug mode if requested
      if (options.debug) {
        logger.setDebug(true);
        logger.debug('Debug mode enabled');
      }

      // Load user configuration
      const userConfig = await loadUserConfig();
      logger.debug('User config loaded', userConfig);

      // Check for updates (unless disabled)
      if (options.updateCheck !== false) {
        await checkForUpdates();
      }

      console.log(chalk.blue.bold('\n🚀 Welcome to RapidKit!\n'));

      // If no name provided, show help
      if (!name) {
        printHelp();
        process.exit(0);
      }

      // Validate name
      try {
        validateProjectName(name);
      } catch (error) {
        if (error instanceof RapidKitError) {
          logger.error(`\n❌ ${error.message}`);
          if (error.details) {
            logger.warn(`💡 ${error.details}\n`);
          }
          process.exit(1);
        }
        throw error;
      }

      const targetPath = path.resolve(process.cwd(), name);
      currentProjectPath = targetPath;

      // Check if directory already exists
      if (await fsExtra.pathExists(targetPath)) {
        logger.error(`\n❌ Directory "${name}" already exists`);
        console.log(chalk.cyan('\n💡 Choose a different name or delete the existing directory.\n'));
        process.exit(1);
      }

      // Determine mode: workspace or project
      const isProjectMode = !!options.template;

      // Validate template if provided
      if (isProjectMode) {
        const template = options.template.toLowerCase();
        const validTemplates = ['fastapi', 'nestjs'];
        if (!validTemplates.includes(template)) {
          logger.error(`\n❌ Invalid template: ${options.template}`);
          console.log(chalk.cyan(`\n📦 Available templates: ${validTemplates.join(', ')}\n`));
          process.exit(1);
        }
      }

      // Dry-run mode
      if (options.dryRun) {
        console.log(chalk.cyan('\n🔍 Dry-run mode - showing what would be created:\n'));
        console.log(chalk.white('📂 Path:'), targetPath);
        console.log(
          chalk.white('📦 Type:'),
          isProjectMode ? `Project (${options.template})` : 'Workspace'
        );
        console.log();
        return;
      }

      // Get details
      let answers;
      if (options.yes) {
        answers = {
          author: process.env.USER || 'RapidKit User',
          description: isProjectMode
            ? `${options.template === 'nestjs' ? 'NestJS' : 'FastAPI'} application generated with RapidKit`
            : undefined,
          package_manager: 'npm',
        };
        console.log(chalk.gray('Using default values (--yes flag)\n'));
      } else if (isProjectMode) {
        // Project prompts
        const template = options.template.toLowerCase();
        if (template === 'fastapi') {
          answers = await inquirer.prompt([
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
        } else {
          answers = await inquirer.prompt([
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
              default: 'NestJS application generated with RapidKit',
            },
            {
              type: 'list',
              name: 'package_manager',
              message: 'Package manager:',
              choices: ['npm', 'yarn', 'pnpm'],
              default: 'npm',
            },
          ]);
        }
      } else {
        // Workspace prompts
        answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'author',
            message: 'Author name:',
            default: process.env.USER || 'RapidKit User',
          },
        ]);
      }

      // Create workspace or project
      if (isProjectMode) {
        await createProject(targetPath, {
          name,
          template: options.template.toLowerCase(),
          author: answers.author,
          description: answers.description,
          package_manager: answers.package_manager,
          skipGit: options.skipGit,
          skipInstall: options.skipInstall,
        });
      } else {
        await createWorkspace(targetPath, {
          name,
          author: answers.author,
          skipGit: options.skipGit,
        });
      }
    } catch (error) {
      if (error instanceof RapidKitError) {
        logger.error(`\n❌ ${error.message}`);
        if (error.details) {
          logger.warn(`💡 ${error.details}`);
        }
        logger.debug('Error code:', error.code);
      } else {
        logger.error('\n❌ An unexpected error occurred:');
        console.error(error);
      }
      process.exit(1);
    } finally {
      currentProjectPath = null;
    }
  });

function printHelp() {
  console.log(chalk.white('Usage: npx rapidkit <name> [options]\n'));

  console.log(chalk.bold('Create a workspace (recommended):'));
  console.log(chalk.cyan('  npx rapidkit my-workspace'));
  console.log(chalk.cyan('  cd my-workspace'));
  console.log(chalk.cyan('  rapidkit create my-api --template fastapi'));
  console.log(chalk.cyan('  cd my-api'));
  console.log(chalk.cyan('  rapidkit dev\n'));

  console.log(chalk.bold('Or create a project directly:'));
  console.log(chalk.cyan('  npx rapidkit my-project --template fastapi'));
  console.log(chalk.cyan('  npx rapidkit my-project --template nestjs\n'));

  console.log(chalk.bold('Options:'));
  console.log(
    chalk.gray('  -t, --template <template>  Create project with template (fastapi, nestjs)')
  );
  console.log(chalk.gray('  -y, --yes                  Skip prompts and use defaults'));
  console.log(chalk.gray('  --skip-git                 Skip git initialization'));
  console.log(chalk.gray('  --skip-install             Skip installing dependencies'));
  console.log(chalk.gray('  --debug                    Enable debug logging'));
  console.log(chalk.gray('  --dry-run                  Show what would be created\n'));

  console.log(chalk.bold('Templates:'));
  console.log(chalk.gray('  fastapi    FastAPI + Python'));
  console.log(chalk.gray('  nestjs     NestJS + TypeScript\n'));
}

// Handle process interruption (Ctrl+C)
process.on('SIGINT', async () => {
  if (cleanupInProgress) return;

  cleanupInProgress = true;
  console.log(chalk.yellow('\n\n⚠️  Interrupted by user'));

  if (currentProjectPath && (await fsExtra.pathExists(currentProjectPath))) {
    console.log(chalk.gray('Cleaning up partial installation...'));
    try {
      await fsExtra.remove(currentProjectPath);
      console.log(chalk.green('✓ Cleanup complete'));
    } catch (error) {
      logger.debug('Cleanup failed:', error);
    }
  }

  process.exit(130);
});

// Handle termination signal
process.on('SIGTERM', async () => {
  if (cleanupInProgress) return;

  cleanupInProgress = true;
  logger.debug('Received SIGTERM');

  if (currentProjectPath && (await fsExtra.pathExists(currentProjectPath))) {
    try {
      await fsExtra.remove(currentProjectPath);
    } catch (error) {
      logger.debug('Cleanup failed:', error);
    }
  }

  process.exit(143);
});

program.parse();
