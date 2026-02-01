#!/usr/bin/env node

import { Command, Option } from 'commander';
import chalk from 'chalk';
import inquirer, { type Question } from 'inquirer';
import path from 'path';
import { spawn } from 'child_process';
import { logger } from './logger.js';
import { checkForUpdates, getVersion } from './update-checker.js';
import { loadUserConfig } from './config.js';
import { validateProjectName } from './validation.js';
import { RapidKitError } from './errors.js';
import * as fsExtra from 'fs-extra';
import fs from 'fs';
import { detectRapidkitProject } from './core-bridge/pythonRapidkit.js';
import {
  getCachedCoreTopLevelCommands,
  resolveRapidkitPython,
  runCoreRapidkit,
} from './core-bridge/pythonRapidkitExec.js';
import { BOOTSTRAP_CORE_COMMANDS_SET } from './core-bridge/bootstrapCoreCommands.js';
import { createProject as createPythonEnvironment, registerWorkspaceAtPath } from './create.js';
import { generateDemoKit } from './demo-kit.js';

type BridgeFailureCode = 'PYTHON_NOT_FOUND' | 'BRIDGE_VENV_BOOTSTRAP_FAILED';

function bridgeFailureCode(err: unknown): BridgeFailureCode | null {
  if (!err || typeof err !== 'object') return null;
  const code = (err as { code?: unknown }).code;
  if (code === 'PYTHON_NOT_FOUND' || code === 'BRIDGE_VENV_BOOTSTRAP_FAILED') return code;
  return null;
}

function normalizeFallbackTemplate(kit: string): 'fastapi' | 'nestjs' | null {
  const k = kit.trim().toLowerCase();
  if (!k) return null;
  if (k.startsWith('fastapi')) return 'fastapi';
  if (k.startsWith('nestjs')) return 'nestjs';
  return null;
}

function readFlagValue(argv: string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  if (idx >= 0 && idx + 1 < argv.length) return argv[idx + 1];
  const eq = argv.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  return undefined;
}

async function runCreateFallback(args: string[], reasonCode: BridgeFailureCode): Promise<number> {
  // Supported offline fallback:
  //   rapidkit create project <kit> <name> [--output <dir>]
  // for kits that have embedded templates (fastapi*, nestjs*).
  const hasJson = args.includes('--json');
  if (hasJson) {
    process.stderr.write(
      'RapidKit (npm) offline fallback does not support --json for `create` commands.\n' +
        'Install Python 3.10+ and retry the same command.\n'
    );
    return 1;
  }

  if (args[0] !== 'create') return 1;
  const sub = args[1];

  if (sub !== 'project') {
    process.stderr.write(
      'RapidKit (npm) could not run the Python core engine for `create`.\n' +
        `Reason: ${reasonCode}.\n` +
        'Install Python 3.10+ to use the interactive wizard and full kit catalog.\n'
    );
    return 1;
  }

  const kit = args[2];
  const name = args[3];
  if (!kit || !name) {
    process.stderr.write(
      'Usage: rapidkit create project <kit> <name> [--output <dir>]\n' +
        'Tip: offline fallback supports only fastapi* and nestjs* kits.\n'
    );
    return 1;
  }

  const template = normalizeFallbackTemplate(kit);
  if (!template) {
    process.stderr.write(
      'RapidKit (npm) could not run the Python core engine to create this kit.\n' +
        `Reason: ${reasonCode}.\n` +
        `Requested kit: ${kit}\n` +
        'Offline fallback only supports: fastapi.standard, nestjs.standard (and their shorthands).\n' +
        'Install Python 3.10+ to access all kits.\n'
    );
    return 1;
  }

  const outputDir = readFlagValue(args, '--output') || process.cwd();
  const projectPath = path.resolve(outputDir, name);

  // Respect common flags used by the npm wrapper.
  const skipGit = args.includes('--skip-git') || args.includes('--no-git');
  const skipInstall = args.includes('--skip-install');

  try {
    await fsExtra.ensureDir(path.dirname(projectPath));
    if (await fsExtra.pathExists(projectPath)) {
      process.stderr.write(`❌ Directory "${projectPath}" already exists\n`);
      return 1;
    }

    await fsExtra.ensureDir(projectPath);
    await generateDemoKit(projectPath, {
      project_name: name,
      template,
      skipGit,
      skipInstall,
    });

    // Sync workspace to register the new project
    const workspacePath = findWorkspaceUp(process.cwd());
    if (workspacePath) {
      const { syncWorkspaceProjects } = await import('./workspace.js');
      await syncWorkspaceProjects(workspacePath, true); // silent sync
    }

    return 0;
  } catch (e) {
    process.stderr.write(`RapidKit (npm) offline fallback failed: ${(e as Error)?.message ?? e}\n`);
    return 1;
  }
}

export async function handleCreateOrFallback(args: string[]): Promise<number> {
  // Supported offline fallback:
  //   rapidkit create project <kit> <name> [--output <dir>]
  // for kits that have embedded templates (fastapi*, nestjs*).

  // If this is a create project invocation, handle wrapper-level flags
  // (workspace creation UX) **before** attempting to run the Python core.
  const WRAPPER_FLAGS = new Set([
    '--yes',
    '-y',
    '--skip-git',
    '--skip-install',
    '--debug',
    '--dry-run',
    '--no-update-check',
    '--create-workspace',
    '--no-workspace',
  ]);

  try {
    // If this is a create project invocation, handle workspace registration
    if (args[0] === 'create' && args[1] === 'project') {
      const hasCreateWorkspace = args.includes('--create-workspace');
      const hasNoWorkspace = args.includes('--no-workspace');
      const hasYes = args.includes('--yes') || args.includes('-y');
      const skipGit = args.includes('--skip-git') || args.includes('--no-git');

      const hasWorkspace = !!findWorkspaceMarkerUp(process.cwd());

      if (!hasWorkspace) {
        if (hasCreateWorkspace) {
          // Non-interactive: create workspace automatically
          await registerWorkspaceAtPath(process.cwd(), {
            skipGit,
            yes: hasYes,
            userConfig: await loadUserConfig(),
          });
        } else if (!hasNoWorkspace) {
          // Interactive flow (default behavior when none of the explicit flags are set)
          if (hasYes) {
            // Default to creating a workspace when --yes is provided
            await registerWorkspaceAtPath(process.cwd(), {
              skipGit,
              yes: true,
              userConfig: await loadUserConfig(),
            });
          } else {
            const { createWs } = (await inquirer.prompt([
              {
                type: 'confirm',
                name: 'createWs',
                message:
                  'This project will be created outside a RapidKit workspace. Create and register a workspace here?',
                default: true,
              } as Question<{ createWs: boolean }>,
            ])) as { createWs: boolean };

            if (createWs) {
              await registerWorkspaceAtPath(process.cwd(), {
                skipGit,
                yes: false,
                userConfig: await loadUserConfig(),
              });
            }
          }
        }
      }

      // Filter wrapper-only flags from args forwarded to the Python core engine
      const filteredArgs = args.filter((a) => {
        const key = a.split('=')[0];
        return !WRAPPER_FLAGS.has(a) && !WRAPPER_FLAGS.has(key);
      });

      try {
        await resolveRapidkitPython();
        const exitCode = await runCoreRapidkit(filteredArgs, { cwd: process.cwd() });

        // If project creation succeeded, sync workspace to register all projects
        if (exitCode === 0) {
          const workspacePath = findWorkspaceUp(process.cwd());
          if (workspacePath) {
            const { syncWorkspaceProjects } = await import('./workspace.js');
            await syncWorkspaceProjects(workspacePath, true); // silent sync
          }
        }

        return exitCode;
      } catch (e) {
        const code = bridgeFailureCode(e);
        if (code) return await runCreateFallback(filteredArgs, code);
        process.stderr.write(
          `RapidKit (npm) failed to run the Python core engine: ${(e as Error)?.message ?? e}\n`
        );
        return 1;
      }
    }

    // Handle `create` command (interactive mode without explicit project subcommand)
    if (args[0] === 'create' && args[1] !== 'project') {
      try {
        await resolveRapidkitPython();
        const exitCode = await runCoreRapidkit(args, { cwd: process.cwd() });

        // If create succeeded, sync workspace to register all projects
        if (exitCode === 0) {
          const workspacePath = findWorkspaceUp(process.cwd());
          if (workspacePath) {
            const { syncWorkspaceProjects } = await import('./workspace.js');
            await syncWorkspaceProjects(workspacePath, true); // silent sync
          }
        }

        return exitCode;
      } catch (e) {
        const code = bridgeFailureCode(e);
        if (code) return await runCreateFallback(args, code);
        process.stderr.write(
          `RapidKit (npm) failed to run the Python core engine: ${(e as Error)?.message ?? e}\n`
        );
        return 1;
      }
    }

    // Not a create project invocation - proceed with default behavior (try core first)
    await resolveRapidkitPython();
    return await runCoreRapidkit(args, { cwd: process.cwd() });
  } catch (e) {
    const code = bridgeFailureCode(e);
    if (code) return await runCreateFallback(args, code);
    process.stderr.write(
      `RapidKit (npm) failed to run the Python core engine: ${(e as Error)?.message ?? e}\n`
    );
    return 1;
  }
}

// Local project commands that should be delegated to ./rapidkit
const LOCAL_COMMANDS = [
  'init',
  'dev',
  'start',
  'build',
  'test',
  'lint',
  'format',
  'create', // workspace command
  'help',
  '--help',
  '-h',
];

// Note: we intentionally avoid any sync-time blocking behavior here.
// `delegateToLocalCLI()` handles python-engine delegation asynchronously.

/**
 * Check if we're inside a RapidKit project and delegate to local CLI if needed
 * If .rapidkit/context.json exists and engine is 'pip', block npm CLI and print message.
 */
function findContextFileUp(start: string): string | null {
  let p = start;

  while (true) {
    const candidate = path.join(p, '.rapidkit', 'context.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

function findWorkspaceMarkerUp(start: string): string | null {
  let p = start;

  while (true) {
    const candidate = path.join(p, '.rapidkit-workspace');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

/**
 * Find workspace directory (not just marker file)
 * Returns the directory containing .rapidkit-workspace
 */
function findWorkspaceUp(start: string): string | null {
  let p = start;

  while (true) {
    const candidate = path.join(p, '.rapidkit-workspace');
    if (fs.existsSync(candidate)) return p; // Return directory, not file
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  return null;
}

async function delegateToLocalCLI(): Promise<boolean> {
  const cwd = process.cwd();
  const args = process.argv.slice(2);

  // CRITICAL: Never delegate 'create' command - npm CLI must handle it for project registry tracking
  if (args[0] === 'create') {
    return false;
  }

  // UX improvement: when the user is already inside a RapidKit workspace created by the VS Code
  // extension (marker: .rapidkit-workspace), prefer showing the Python Core help output.
  // This avoids confusing users with npm workspace-creation help when they simply type `rapidkit`.
  try {
    const firstArg = args[0];
    const isHelpLike =
      !firstArg || firstArg === '--help' || firstArg === '-h' || firstArg === 'help';
    const marker = findWorkspaceMarkerUp(cwd);
    if (marker && isHelpLike) {
      const code = await runCoreRapidkit(firstArg ? ['--help'] : [], { cwd });
      process.exit(code);
    }
  } catch {
    // Ignore and fall back to normal npm CLI behavior.
  }

  // Prefer the official Core contract when possible (best-effort).
  // This is safe here because this function is awaited before CLI execution.
  try {
    const firstArg = args[0];

    const allowShellActivate = firstArg === 'shell' && args[1] === 'activate';

    // DON'T delegate `create` command - let npm CLI handle it for project registry tracking
    const isCreateCommand = firstArg === 'create';

    const detected = await detectRapidkitProject(cwd, { cwd, timeoutMs: 1200 });
    if (detected.ok && detected.data?.isRapidkitProject && detected.data.engine === 'python') {
      if (!allowShellActivate && !isCreateCommand) {
        const code = await runCoreRapidkit(process.argv.slice(2), { cwd });
        process.exit(code);
      }
      // allow npm-only shell helpers and create command
    }
  } catch {
    // Ignore and fall back to filesystem detection.
  }

  // Walk upwards looking for .rapidkit directory (project may be in parent dir)
  const contextFile = findContextFileUp(cwd);

  // FIRST: Check if we have a local rapidkit script and should delegate
  // This works for BOTH npm and pip engine projects
  const isWindows = process.platform === 'win32';
  const localScriptCandidates = isWindows
    ? [
        path.join(cwd, 'rapidkit.cmd'),
        path.join(cwd, 'rapidkit'),
        path.join(cwd, '.rapidkit', 'rapidkit.cmd'),
        path.join(cwd, '.rapidkit', 'rapidkit'),
      ]
    : [path.join(cwd, 'rapidkit'), path.join(cwd, '.rapidkit', 'rapidkit')];

  let localScript: string | null = null;
  for (const candidate of localScriptCandidates) {
    if (await fsExtra.pathExists(candidate)) {
      localScript = candidate;
      break;
    }
  }

  const firstArg = args[0];

  // DON'T delegate `create` command - let npm CLI handle it for project registry tracking
  const isCreateCommand = firstArg === 'create';

  // If we have a local script AND the command is a local command, delegate immediately
  // This works for projects created with --template (npm engine) and workspace projects
  if (localScript && firstArg && LOCAL_COMMANDS.includes(firstArg) && !isCreateCommand) {
    logger.debug(`Delegating to local CLI: ${localScript} ${args.join(' ')}`);

    const child = spawn(localScript, args, {
      stdio: 'inherit',
      cwd,
      shell: isWindows,
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

  // Special handling for pip-engine projects (Python RapidKit)
  // Delegate to the Python core engine when context.json reports pip.
  if (contextFile && (await fsExtra.pathExists(contextFile))) {
    try {
      const ctx = await fsExtra.readJson(contextFile);
      if (ctx.engine === 'pip') {
        const firstArg = args[0];

        // If a local project script exists, delegate there first (prefer local CLI)
        // On Windows, prefer .cmd files
        const isWin = process.platform === 'win32';
        const localScriptCandidatesEarly = isWin
          ? [
              path.join(cwd, 'rapidkit.cmd'),
              path.join(cwd, 'rapidkit'),
              path.join(cwd, '.rapidkit', 'rapidkit.cmd'),
              path.join(cwd, '.rapidkit', 'rapidkit'),
            ]
          : [path.join(cwd, 'rapidkit'), path.join(cwd, '.rapidkit', 'rapidkit')];
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

        // Allow shell activate requests (prints activation snippet).
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

        // Delegate all other commands to core.
        const code = await runCoreRapidkit(args, { cwd });
        process.exit(code);
      }
    } catch (_e) {
      // ignore parse errors, fallback to normal behavior
    }
  }

  // No delegation needed - let the main CLI handle it
  return false;
}

// Track current project path for cleanup on interrupt
let currentProjectPath: string | null = null;
let cleanupInProgress = false;

const program = new Command();

// Legacy flags are intentionally hidden by default. Tests and current UX
// expect legacy template-related flags to remain out of the primary help
// output, even when environment variables are present.
const SHOW_LEGACY = false;

async function shouldForwardToCore(args: string[]): Promise<boolean> {
  if (args.length === 0) return false;

  const first = args[0];
  const second = args[1];

  // npm-only commands
  if (first === 'shell' && second === 'activate') return false;
  if (first === 'workspace') return false; // workspace management is npm-only

  // core global flag
  if (args.includes('--tui')) return true;

  // npm UX/help/version flags should remain handled by this wrapper
  if (
    first === '--help' ||
    first === '-h' ||
    first === 'help' ||
    first === '--version' ||
    first === '-V'
  ) {
    return false;
  }

  // npm-only shorthand flags
  if (args.includes('--template') || args.includes('-t')) return false;

  // Wrapper-only flags/options mean we're in "create workspace/project" mode.
  // In that case, do not spend time bootstrapping core just to disambiguate.
  const WRAPPER_FLAGS = new Set([
    '--yes',
    '-y',
    '--skip-git',
    '--skip-install',
    '--debug',
    '--dry-run',
    '--no-update-check',
    '--create-workspace',
    '--no-workspace',
  ]);
  if (args.some((a) => WRAPPER_FLAGS.has(a))) return false;

  // Cache-first: if we already discovered core commands previously, use that.
  const cached = await getCachedCoreTopLevelCommands();
  if (cached) {
    return cached.has(first);
  }

  // No cache yet.
  // For well-known core commands, forward immediately so failures (e.g., missing Python)
  // are handled by the bridge instead of being mis-parsed by the wrapper.
  if (BOOTSTRAP_CORE_COMMANDS_SET.has(first)) return true;

  // If the user provided multiple args and none of the wrapper flags matched,
  // this is almost certainly a core invocation.
  if (args.length > 1) return true;

  // Otherwise, treat it as a workspace/project name and let commander handle it.
  return false;

  // Unreachable, but kept for clarity if logic changes later.
  // const coreCommands = await getCoreTopLevelCommands();
  // return coreCommands.has(first);
}

program
  .name('rapidkit')
  .description('Create RapidKit workspaces and projects')
  .version(getVersion());

// Add consistent help headings expected by the tests and UX consumers.
program.addHelpText(
  'beforeAll',
  `RapidKit

Global CLI
Create RapidKit workspaces and projects

Global Engine Commands
Access engine-level commands when inside a RapidKit workspace or via the core bridge
`
);

program.addHelpText(
  'afterAll',
  `
Project Commands
  rapidkit create
  rapidkit init
  rapidkit dev

Use "rapidkit help <command>" for more information.
`
);

// Main command: npx rapidkit <name>
program
  .argument('[name]', 'Name of the workspace or project directory')
  .addOption(
    new Option(
      '-t, --template <template>',
      'Legacy: create a project with template (fastapi, nestjs) instead of a workspace'
    ).hideHelp()
  )
  .option('-y, --yes', 'Skip prompts and use defaults')
  .addOption(new Option('--skip-git', 'Skip git initialization').hideHelp())
  .addOption(
    new Option('--skip-install', 'Legacy: skip installing dependencies (template mode)').hideHelp()
  )
  .option('--debug', 'Enable debug logging')
  .addOption(new Option('--dry-run', 'Show what would be created without creating it').hideHelp())
  .addOption(
    new Option('--install-method <method>', 'Installation method: poetry, venv, or pipx')
      .choices(['poetry', 'venv', 'pipx'])
      .hideHelp()
  )
  .addOption(
    new Option(
      '--create-workspace',
      'When creating a project outside a workspace: create and register a workspace in the current directory'
    ).hideHelp()
  )
  .addOption(
    new Option(
      '--no-workspace',
      'When creating a project outside a workspace: do not create a workspace'
    ).hideHelp()
  )
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

      // In project mode, allow any kit slug (core is the source of truth).
      // Keep backward-compatible shorthands: fastapi -> fastapi.standard, nestjs -> nestjs.standard.

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
      if (!options.yes && !isProjectMode) {
        // Workspace prompts (provisioning mode only)
        await inquirer.prompt([
          {
            type: 'input',
            name: 'author',
            message: 'Author name:',
            default: process.env.USER || 'RapidKit User',
          },
        ]);
      } else if (options.yes) {
        console.log(chalk.gray('Using default values (--yes flag)\n'));
      }

      // Create workspace or project
      if (isProjectMode) {
        const raw = String(options.template || '').trim();
        const lowered = raw.toLowerCase();
        const kit =
          lowered === 'fastapi'
            ? 'fastapi.standard'
            : lowered === 'nestjs'
              ? 'nestjs.standard'
              : raw;

        // If we're outside a registered workspace, offer to create/register one so the
        // newly created project is tracked and the workspace tools (local venv, launcher)
        // are set up. Flags:
        //   --create-workspace  : create workspace automatically
        //   --no-workspace      : do not create a workspace
        const hasWorkspace = !!findWorkspaceMarkerUp(process.cwd());
        if (!hasWorkspace) {
          if (options.createWorkspace) {
            // Non-interactive: create workspace automatically
            await registerWorkspaceAtPath(process.cwd(), {
              skipGit: options.skipGit,
              yes: options.yes,
              userConfig,
            });
          } else if (!options.noWorkspace) {
            // Interactive: prompt the user (unless --no-workspace was specified)
            if (options.yes) {
              // Default to creating a workspace when --yes is provided
              await registerWorkspaceAtPath(process.cwd(), {
                skipGit: options.skipGit,
                yes: true,
                userConfig,
              });
            } else {
              const { createWs } = (await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'createWs',
                  message:
                    'This project will be created outside a RapidKit workspace. Create and register a workspace here?',
                  default: true,
                } as Question<{ createWs: boolean }>,
              ])) as { createWs: boolean };

              if (createWs) {
                await registerWorkspaceAtPath(process.cwd(), {
                  skipGit: options.skipGit,
                  yes: false,
                  userConfig,
                });
              }
            }
          }
        }

        const createArgs = [
          'create',
          'project',
          kit,
          name,
          '--output',
          process.cwd(),
          '--install-essentials',
        ];

        const createCode = await runCoreRapidkit(createArgs, { cwd: process.cwd() });
        if (createCode !== 0) process.exit(createCode);

        if (!options.skipInstall) {
          const initCode = await runCoreRapidkit(['init', targetPath], { cwd: process.cwd() });
          if (initCode !== 0) process.exit(initCode);
        }
      } else {
        await createPythonEnvironment(name, {
          skipGit: options.skipGit,
          dryRun: options.dryRun,
          yes: options.yes,
          userConfig,
          installMethod: options.installMethod,
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

// Workspace management command
program
  .command('workspace <action>')
  .description('Manage RapidKit workspaces (list, sync)')
  .action(async (action: string) => {
    if (action === 'list') {
      const { listWorkspaces } = await import('./workspace.js');
      await listWorkspaces();
    } else if (action === 'sync') {
      const workspacePath = findWorkspaceUp(process.cwd());
      if (!workspacePath) {
        console.log(chalk.red('❌ Not inside a RapidKit workspace'));
        console.log(chalk.gray('💡 Run this command from within a workspace directory'));
        process.exit(1);
      }
      const { syncWorkspaceProjects } = await import('./workspace.js');
      console.log(chalk.cyan(`📂 Scanning workspace: ${path.basename(workspacePath)}`));
      await syncWorkspaceProjects(workspacePath);
    } else {
      console.log(chalk.red(`Unknown workspace action: ${action}`));
      console.log(chalk.gray('Available: list, sync'));
      process.exit(1);
    }
  });

function printHelp() {
  console.log(chalk.white('Usage:\n'));
  console.log(chalk.cyan('  npx rapidkit <workspace-name> [options]'));
  console.log(chalk.cyan('  npx rapidkit create <...>\n'));

  console.log(chalk.bold('Recommended workflow:'));
  console.log(chalk.cyan('  npx rapidkit my-workspace'));
  console.log(chalk.cyan('  cd my-workspace'));
  console.log(chalk.cyan('  npx rapidkit create project fastapi.standard my-api --output .'));
  console.log(chalk.cyan('  cd my-api'));
  console.log(chalk.cyan('  npx rapidkit init && npx rapidkit dev\n'));

  console.log(chalk.bold('Options (workspace creation):'));
  console.log(chalk.gray('  -y, --yes                  Skip prompts and use defaults'));
  console.log(chalk.gray('  --skip-git                 Skip git initialization'));
  console.log(chalk.gray('  --debug                    Enable debug logging'));
  console.log(chalk.gray('  --dry-run                  Show what would be created'));
  console.log(
    chalk.gray(
      '  --create-workspace         When creating a project outside a workspace: create and register a workspace in the current directory'
    )
  );
  console.log(
    chalk.gray(
      '  --no-workspace             When creating a project outside a workspace: do not create a workspace'
    )
  );
  console.log(chalk.gray('  --no-update-check          Skip checking for updates\n'));

  if (SHOW_LEGACY) {
    console.log(chalk.bold('Legacy (shown because RAPIDKIT_SHOW_LEGACY=1):'));
    console.log(chalk.gray('  npx rapidkit my-project --template fastapi'));
    console.log(chalk.gray('  npx rapidkit my-project --template nestjs'));
    console.log(
      chalk.gray(
        '  --skip-install             Skip installing dependencies (legacy template mode)\n'
      )
    );
  } else {
    console.log(
      chalk.gray('Tip: set RAPIDKIT_SHOW_LEGACY=1 to show legacy template flags in help.\n')
    );
  }
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
    const args = process.argv.slice(2);

    if (process.env.RAPIDKIT_NPM_DEBUG_ARGS === '1') {
      // Intentionally write to stderr to avoid corrupting JSON stdout from core.
      process.stderr.write(`[rapidkit-npm] argv=${JSON.stringify(args)}\n`);
    }

    // Special-case `create` to preserve canonical Core UX while allowing a
    // last-resort offline fallback (fastapi/nestjs scaffolds) when Python/Core
    // cannot run.
    if (args[0] === 'create') {
      const code = await handleCreateOrFallback(args);
      process.exit(code);
    }

    const shouldForward = await shouldForwardToCore(args);
    if (process.env.RAPIDKIT_NPM_DEBUG_ARGS === '1') {
      process.stderr.write(`[rapidkit-npm] shouldForwardToCore=${shouldForward}\n`);
    }

    if (shouldForward) {
      const code = await runCoreRapidkit(args, { cwd: process.cwd() });
      process.exit(code);
    }
    program.parse();
  }
});
