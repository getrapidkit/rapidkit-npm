#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createProject } from './create.js';
import { generateDemoKit } from './demo-kit.js';
import inquirer from 'inquirer';
import path from 'path';
import { logger } from './logger.js';
import { checkForUpdates, getVersion } from './update-checker.js';
import { loadUserConfig } from './config.js';
import { validateProjectName } from './validation.js';
import { RapidKitError } from './errors.js';
import * as fsExtra from 'fs-extra';

// Track current project path for cleanup on interrupt
let currentProjectPath: string | null = null;
let cleanupInProgress = false;

const program = new Command();

program
  .name('create-rapidkit')
  .description('Create a RapidKit development environment or workspace')
  .version(getVersion())
  .argument('[directory-name]', 'Name of the workspace or project directory')
  .option('--skip-git', 'Skip git initialization')
  .option('--test-mode', 'Install RapidKit from local path (for development/testing only)')
  .option('--demo', 'Create workspace with demo kit templates (no Python installation required)')
  .option('--demo-only', 'Generate a demo project in current directory (used by demo workspace)')
  .option('--debug', 'Enable debug logging')
  .option('--dry-run', 'Show what would be created without creating it')
  .option('--no-update-check', 'Skip checking for updates')
  .action(async (directoryName, options) => {
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

      console.log(chalk.blue.bold('\n🚀 Welcome to create-rapidkit!\n'));

      // Demo-only mode - generate project directly without workspace
      if (options.demoOnly) {
        const projectName = directoryName || 'my-fastapi-project';

        // Validate project name
        try {
          validateProjectName(projectName);
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

        const projectPath = path.resolve(process.cwd(), projectName);
        currentProjectPath = projectPath;

        // Dry-run mode
        if (options.dryRun) {
          console.log(chalk.cyan('\n🔍 Dry-run mode - showing what would be created:\n'));
          console.log(chalk.white('📂 Project path:'), projectPath);
          console.log(chalk.white('📦 Project type:'), 'FastAPI demo project');
          console.log(chalk.white('📝 Files to create:'));
          console.log(chalk.gray('  - src/main.py'));
          console.log(chalk.gray('  - src/cli.py'));
          console.log(chalk.gray('  - src/routing/'));
          console.log(chalk.gray('  - tests/'));
          console.log(chalk.gray('  - pyproject.toml'));
          console.log(chalk.gray('  - README.md\n'));
          return;
        }

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

      // Validate workspace name
      try {
        validateProjectName(workspaceName);
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

      currentProjectPath = path.resolve(process.cwd(), workspaceName);

      if (options.demo) {
        // Demo mode - create workspace with demo capabilities
        console.log(
          chalk.gray(
            'This will create a workspace with demo kit templates.\nYou can generate demo projects inside without installing Python RapidKit.\n'
          )
        );

        await createProject(workspaceName, {
          skipGit: options.skipGit || userConfig.skipGit,
          testMode: false,
          demoMode: true,
          dryRun: options.dryRun,
          userConfig,
        });
        return;
      }

      // Normal mode - full RapidKit installation
      console.log(chalk.yellow.bold('⚠️  BETA NOTICE\n'));
      console.log(
        chalk.yellow(
          'RapidKit Python package is not yet available on PyPI.\n' +
            'Full installation mode will be available soon.\n'
        )
      );
      console.log(chalk.cyan('For now, please use one of these options:\n'));
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
        skipGit: options.skipGit || userConfig.skipGit,
        testMode: options.testMode,
        demoMode: false,
        dryRun: options.dryRun,
        userConfig,
      });
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
