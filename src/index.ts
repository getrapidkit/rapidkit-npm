#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { spawn } from 'child_process';
import { logger } from './logger.js';
import { checkForUpdates, getVersion } from './update-checker.js';
import { loadUserConfig } from './config.js';
import { validateProjectName } from './validation.js';
import { RapidKitError } from './errors.js';
import * as fsExtra from 'fs-extra';
import fs from 'fs';
import { createWorkspace, createProject } from './workspace.js';

// Local project commands that should be delegated to ./rapidkit
const LOCAL_COMMANDS = [
  'init',
  'dev',
  'start',
  'build',
  'test',
  'lint',
  'format',
  'help',
  '--help',
  '-h',
];

// Top-level helper functions moved to module scope
function findContextFileUpSync(start: string): string | null {
  let p = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = path.join(p, '.rapidkit', 'context.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

// Walk up looking for a local rapidkit launcher (project-local CLI). If one
// exists, allow delegation so the later async check can spawn it. This is
// fast/sync and intentionally mirrors the async delegateToLocalCLI logic.
function findLocalLauncherUpSync(start: string): string | null {
  let p = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const top = path.join(p, 'rapidkit');
    const dot = path.join(p, '.rapidkit', 'rapidkit');
    if (fs.existsSync(top)) return top;
    if (fs.existsSync(dot)) return dot;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

// Top-level, sync safety check: if we are inside a pip-based project and the
// user didn't explicitly request 'init', block npm CLI immediately. This
// prevents the global npm CLI from interacting with projects created by the
// Python engine.
(() => {
  try {
    const cwd = process.cwd();
    const args = process.argv.slice(2);
    const firstArg = args[0];

    const ctxFile = findContextFileUpSync(cwd);
    if (ctxFile && fs.existsSync(ctxFile)) {
      const raw = fs.readFileSync(ctxFile, 'utf8');
      try {
        const ctx = JSON.parse(raw);
        // Allow init, `shell activate`, and any command we can delegate to a
        // local project launcher (dev, start, build, etc.). If we find a
        // project-local launcher and the command is in LOCAL_COMMANDS, allow
        // through so later async code can delegate to it.
        const allowShellActivate = firstArg === 'shell' && process.argv.slice(2)[1] === 'activate';
        const localLauncher = findLocalLauncherUpSync(cwd);
        const allowDelegate = localLauncher && firstArg && LOCAL_COMMANDS.includes(firstArg);

        if (ctx?.engine === 'pip' && !allowShellActivate && !allowDelegate && firstArg !== 'init') {
          console.log(
            chalk.yellow(
              '\n⚠️  This project uses the Python RapidKit engine (pip). The global npm RapidKit CLI will not operate on this project.\n' +
                "💡 To prepare this project run: 'rapidkit init' (it uses the project's Python toolchain)\n"
            )
          );
          process.exit(0);
        }
      } catch (_) {
        // ignore parse errors
      }
    }
  } catch (_) {
    // best-effort, do nothing on failure
  }
})();

/**
 * Check if we're inside a RapidKit project and delegate to local CLI if needed
 * If .rapidkit/context.json exists and engine is 'pip', block npm CLI and print message.
 */
function findContextFileUp(start: string): string | null {
  let p = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = path.join(p, '.rapidkit', 'context.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

async function delegateToLocalCLI(): Promise<boolean> {
  const cwd = process.cwd();

  // Walk upwards looking for .rapidkit/context.json (project may be in parent dir)
  const contextFile = findContextFileUp(cwd);
  const rapidkitDir = contextFile ? path.dirname(contextFile) : path.join(cwd, '.rapidkit');

  // Block npm CLI if context.json exists and engine is pip
  if (contextFile && (await fsExtra.pathExists(contextFile))) {
    try {
      const ctx = await fsExtra.readJson(contextFile);
      if (ctx.engine === 'pip') {
        const args = process.argv.slice(2);
        const firstArg = args[0];

        // If a local project script exists, delegate there first (prefer local CLI)
        const localScriptCandidatesEarly = [
          path.join(cwd, 'rapidkit'),
          path.join(cwd, '.rapidkit', 'rapidkit'),
        ];
        let localScriptEarly: string | null = null;
        for (const c of localScriptCandidatesEarly) {
          if (await fsExtra.pathExists(c)) {
            localScriptEarly = c;
            break;
          }
        }

        if (localScriptEarly && firstArg && LOCAL_COMMANDS.includes(firstArg)) {
          // Delegate to local CLI and return
          logger.debug(
            `Delegating to local CLI (early detection): ${localScriptEarly} ${args.join(' ')}`
          );
          const child = spawn(localScriptEarly, args, { stdio: 'inherit', cwd });
          child.on('close', (code) => process.exit(code ?? 0));
          child.on('error', (err) => {
            logger.error(`Failed to run local rapidkit: ${err.message}`);
            process.exit(1);
          });
          return true;
        }

        // Allow shell activate requests (prints activation snippet) or init.
        // For any other invocation, display a friendly message and do not proceed
        // with npm CLI behavior.
        if (firstArg === 'shell' && args[1] === 'activate') {
          const snippet = `# RapidKit: activation snippet - eval "$(rapidkit shell activate)"\nVENV='.venv'\nif [ -f "$VENV/bin/activate" ]; then\n  . "$VENV/bin/activate"\nelif [ -f "$VENV/bin/activate.fish" ]; then\n  source "$VENV/bin/activate.fish"\nfi\nexport RAPIDKIT_PROJECT_ROOT="$(pwd)"\nexport PATH="$(pwd)/.rapidkit:$(pwd):$PATH"\n`;
          console.log(
            chalk.green.bold(
              '\n✅ Activation snippet — run the following to activate this project in your current shell:\n'
            )
          );
          console.log(snippet);
          console.log(chalk.gray('\n💡 After activation you can run: rapidkit dev\n'));
          process.exit(0);
        }

        // If user explicitly asked to `init` we try to help by installing the Python CLI
        // for them (only in that case).
        if (firstArg !== 'init') {
          const dynamicChalk = (await import('chalk')).default;
          console.log(
            dynamicChalk.yellow(
              '\n⚠️  This project uses the Python RapidKit engine (pip). The global npm RapidKit CLI will not operate on this project.\n' +
                "💡 To prepare this project run: 'rapidkit init' (it uses the project's Python toolchain)\n\n"
            )
          );
          // Prevent any npm CLI behaviour
          process.exit(0);
        }
        const dynamicChalk = (await import('chalk')).default;
        console.log(
          dynamicChalk.yellow(
            '\n⚠️  This project was created with the Python engine (pip). RapidKit (npm) will try to install the Python CLI for you...\n'
          )
        );

        // Try a robust, cross-system install sequence: prefer python3 -m pip, fallback to python -m pip, then pip
        const { spawnSync } = await import('child_process');
        const installers: Array<[string, string[]]> = [
          ['python3', ['-m', 'pip', 'install', 'rapidkit-core']],
          ['python', ['-m', 'pip', 'install', 'rapidkit-core']],
          ['pip', ['install', 'rapidkit-core']],
        ];

        // Ask user for confirmation before auto-installing the Python CLI
        let userConfirmed = true;
        if (process.stdin.isTTY) {
          try {
            const answer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message:
                  'This project needs the Python RapidKit CLI (rapidkit). Do you want to try installing it now using pip?',
                default: true,
              },
            ]);
            userConfirmed = !!answer.confirm;
          } catch (_e) {
            userConfirmed = false;
          }
        } else {
          // Non-interactive: do not auto-install
          userConfirmed = false;
        }

        if (!userConfirmed) {
          const c = (await import('chalk')).default;
          console.log(
            c.yellow(
              '\n⚠️  Skipping automatic installation of the Python RapidKit CLI (rapidkit-core).\n' +
                "💡 To continue, either run 'rapidkit init' locally after installing rapidkit-core: `python3 -m pip install rapidkit-core`\n"
            )
          );
          // Do not proceed with npm CLI behavior
          process.exit(0);
        }

        let result: any = { status: 1 };
        if (userConfirmed) {
          for (const [cmd, args] of installers) {
            try {
              console.log(chalk.gray(`Running: ${cmd} ${args.join(' ')}\n`));
              result = spawnSync(cmd, args, { stdio: 'inherit' });
              if (result && result.status === 0) break;
            } catch (_err) {
              // try next installer
            }
          }
        }

        if (result && result.status === 0) {
          const okChalk = (await import('chalk')).default;
          console.log(
            okChalk.green(
              '\n✅ RapidKit Python CLI (rapidkit) installed successfully!\nPlease re-run your command.\n'
            )
          );
        } else {
          const errChalk = (await import('chalk')).default;
          console.log(
            errChalk.red(
              '\n❌ Failed to install RapidKit Python CLI automatically.\n' +
                '💡 Manual install options:\n  python3 -m pip install rapidkit\n  python -m pip install rapidkit\n  pip install rapidkit\n'
            )
          );
        }
        process.exit(result.status ?? 1);
      }
    } catch (_e) {
      // ignore parse errors, fallback to normal behavior
    }
  }

  // ...existing code...
  // Prefer top-level local rapidkit script, but also accept .rapidkit/rapidkit
  const localScriptCandidates = [
    path.join(cwd, 'rapidkit'),
    path.join(cwd, '.rapidkit', 'rapidkit'),
  ];
  let localScript = path.join(cwd, 'rapidkit');
  for (const candidate of localScriptCandidates) {
    if (await fsExtra.pathExists(candidate)) {
      localScript = candidate;
      break;
    }
  }
  const hasLocalScript = await fsExtra.pathExists(localScript);
  const hasRapidkitDir = await fsExtra.pathExists(rapidkitDir);

  if (!hasLocalScript || !hasRapidkitDir) {
    return false;
  }

  // ...existing code...
  const args = process.argv.slice(2);
  const firstArg = args[0];

  if (!firstArg || !LOCAL_COMMANDS.includes(firstArg)) {
    return false;
  }

  // Delegate to local ./rapidkit script
  logger.debug(`Delegating to local CLI: ./rapidkit ${args.join(' ')}`);

  const child = spawn(localScript, args, {
    stdio: 'inherit',
    cwd,
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    logger.error(`Failed to run local rapidkit: ${err.message}`);
    process.exit(1);
  });

  return true;
}

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

// Shell helpers - e.g. `rapidkit shell activate` prints an eval-able activation snippet
program
  .command('shell <action>')
  .description('Shell helpers (activate virtualenv in current shell)')
  .action(async (action: string) => {
    if (action !== 'activate') {
      console.log(chalk.red(`Unknown shell command: ${action}`));
      process.exit(1);
    }

    const cwd = process.cwd();
    // search for context.json up the tree
    function findContext(start: string): string | null {
      let p = start;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const candidate = path.join(p, '.rapidkit', 'context.json');
        if (fs.existsSync(candidate)) return candidate;
        const parent = path.dirname(p);
        if (parent === p) break;
        p = parent;
      }
      return null;
    }

    // Try to find a RapidKit context.json file in the tree.
    // If the context can't be read/parsed we still try to be helpful:
    // - If a .venv directory exists (or a `.rapidkit/activate` file), print activation
    //   snippet so the user can `eval "$(rapidkit shell activate)"` and continue.
    const ctxFile = findContext(cwd);

    // Helper: search upwards for a `.venv` directory or `.rapidkit/activate`
    function findActivationCandidate(start: string) {
      let p = start;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const venv = path.join(p, '.venv');
        const activateFile = path.join(p, '.rapidkit', 'activate');
        if (fs.existsSync(activateFile) || fs.existsSync(venv)) return { venv, activateFile };
        const parent = path.dirname(p);
        if (parent === p) break;
        p = parent;
      }
      return null;
    }

    const candidate = findActivationCandidate(cwd);
    // If we didn't find either context.json or an activation candidate, bail
    if (!ctxFile && !candidate) {
      console.log(chalk.red('No RapidKit project found to activate'));
      process.exit(1);
    }

    // If we were able to find a valid activation place, print the snippet and exit.
    // Guard: prefer the candidate activation even if ctxFile exists but is broken.
    if (candidate) {
      const snippet = `# RapidKit: activation snippet - eval "$(rapidkit shell activate)"\nVENV='.venv'\nif [ -f "$VENV/bin/activate" ]; then\n  . "$VENV/bin/activate"\nelif [ -f "$VENV/bin/activate.fish" ]; then\n  source "$VENV/bin/activate.fish"\nfi\nexport RAPIDKIT_PROJECT_ROOT="$(pwd)"\nexport PATH="$(pwd)/.rapidkit:$(pwd):$PATH"\n`;
      console.log(
        chalk.green.bold(
          '\n✅ Activation snippet — run the following to activate this project in your current shell:\n'
        )
      );
      console.log(snippet);
      console.log(chalk.gray('\n💡 After activation you can run: rapidkit dev\n'));
      process.exit(0);
    }

    // Fallback: we had a context file but couldn't find activation files — try to read it.
    try {
      const ctx = await fsExtra.readJson(ctxFile as string);
      if (ctx.engine !== 'pip') {
        console.log(chalk.yellow('This project is not a pip-based RapidKit project.'));
        process.exit(1);
      }

      // Fall back to printing the standard snippet even if context.json said pip (keeps behavior)
      const snippet = `# RapidKit: activation snippet - eval "$(rapidkit shell activate)"\nVENV='.venv'\nif [ -f "$VENV/bin/activate" ]; then\n  . "$VENV/bin/activate"\nelif [ -f "$VENV/bin/activate.fish" ]; then\n  source "$VENV/bin/activate.fish"\nfi\nexport RAPIDKIT_PROJECT_ROOT="$(pwd)"\nexport PATH="$(pwd)/.rapidkit:$(pwd):$PATH"\n`;
      console.log(snippet);
      process.exit(0);
    } catch (_err) {
      // If reading/context parsing failed, still try to be helpful — if there's no
      // activation candidate we already would have exited above; this keeps the
      // behavior forgiving instead of failing hard.
      console.log(
        chalk.yellow(
          'Could not read project context but found a venv or activation file — printing activation snippet'
        )
      );
      const snippet = `# RapidKit: activation snippet - eval "$(rapidkit shell activate)"\nVENV='.venv'\nif [ -f "$VENV/bin/activate" ]; then\n  . "$VENV/bin/activate"\nelif [ -f "$VENV/bin/activate.fish" ]; then\n  source "$VENV/bin/activate.fish"\nfi\nexport RAPIDKIT_PROJECT_ROOT="$(pwd)"\nexport PATH="$(pwd):$PATH"\n`;
      console.log(snippet);
      process.exit(0);
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

// Delegate to local CLI if inside a RapidKit project
delegateToLocalCLI().then(async (delegated) => {
  if (!delegated) {
    // Final safety: if we are in a pip-based project (context.json engine=pip)
    // and the user didn't explicitly run 'init', block npm CLI and show message.
    const cwd = process.cwd();

    try {
      const contextFile = findContextFileUp(cwd);
      if (contextFile && (await fsExtra.pathExists(contextFile))) {
        const ctx = await fsExtra.readJson(contextFile);
        const firstArg = process.argv.slice(2)[0];
        if (ctx?.engine === 'pip' && firstArg !== 'init') {
          const dynamicChalk = (await import('chalk')).default;
          console.log(
            dynamicChalk.yellow(
              '\n⚠️  This project uses the Python RapidKit engine (pip). The global npm RapidKit CLI will not operate on this project.\n' +
                "💡 To prepare this project run: 'rapidkit init' (it uses the project's Python toolchain)\n\n"
            )
          );
          process.exit(0);
        }
      }
    } catch (_e) {
      // ignore and continue to parse
    }

    program.parse();
  }
});
