import { promises as fsPromises } from 'fs';
import * as fsExtra from 'fs-extra';
import * as os from 'os';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { execa } from 'execa';
import { logger } from './logger.js';
import { UserConfig, getTestRapidKitPath } from './config.js';
import { getVersion } from './update-checker.js';
import {
  DirectoryExistsError,
  PythonNotFoundError,
  PoetryNotFoundError,
  PipxNotFoundError,
  InstallationError,
  RapidKitNotAvailableError,
} from './errors.js';
import { getPythonCommand } from './utils.js';
import {
  createNpmWorkspaceMarker,
  writeWorkspaceMarker as writeWorkspaceMarkerToFile,
} from './workspace-marker.js';

async function writeWorkspaceMarker(
  workspacePath: string,
  workspaceName: string,
  installMethod?: 'poetry' | 'venv' | 'pipx',
  pythonVersion?: string
): Promise<void> {
  const markerObj = createNpmWorkspaceMarker(workspaceName, getVersion(), installMethod);

  // Add Python version to marker if provided
  if (pythonVersion) {
    if (!markerObj.metadata) markerObj.metadata = {};
    (markerObj.metadata as Record<string, unknown>).python = { version: pythonVersion };
  }

  await writeWorkspaceMarkerToFile(workspacePath, markerObj);
}

async function writeWorkspaceGitignore(workspacePath: string): Promise<void> {
  // Keep parity with the VS Code extension workspace output.
  await fsExtra.outputFile(
    path.join(workspacePath, '.gitignore'),
    '.venv/\n__pycache__/\n*.pyc\n.env\n.rapidkit-workspace/\n\n',
    'utf-8'
  );
}

type InstallMethod = 'poetry' | 'venv' | 'pipx';

type PipxInvoker = { kind: 'binary' } | { kind: 'python-module'; pythonCmd: string };

// Detect actual Python version installed on system (not just requested version)
async function detectActualPythonVersion(pythonCmd: string): Promise<string | null> {
  try {
    const { stdout } = await execa(pythonCmd, ['--version'], { timeout: 3000 });
    const match = stdout.match(/Python (\d+\.\d+\.\d+)/);
    if (match) {
      return match[1]; // Return full version like "3.10.19"
    }
  } catch {
    // Ignore
  }
  return null;
}

// Write .python-version file to workspace for pyenv compatibility
async function writePythonVersion(workspacePath: string, pythonVersion: string): Promise<void> {
  try {
    await fsPromises.writeFile(
      path.join(workspacePath, '.python-version'),
      `${pythonVersion}\n`,
      'utf-8'
    );
    logger.debug(`Created .python-version with ${pythonVersion}`);
  } catch (error) {
    logger.warn(`Failed to create .python-version: ${error}`);
  }
}

function ensureUserLocalBinOnPath(): void {
  // pipx typically installs shims into ~/.local/bin on Linux/macOS.
  // Add it for this process so we can run `poetry` immediately after installing.
  const localBin = path.join(os.homedir(), '.local', 'bin');
  const current = process.env.PATH || '';
  const parts = current.split(path.delimiter).filter(Boolean);
  if (!parts.includes(localBin)) {
    process.env.PATH = [localBin, ...parts].join(path.delimiter);
  }
}

async function ensurePipxAvailable(spinner: Ora, yes: boolean): Promise<PipxInvoker> {
  ensureUserLocalBinOnPath();

  spinner.start('Checking pipx installation');
  try {
    await execa('pipx', ['--version']);
    spinner.succeed('pipx found');
    return { kind: 'binary' };
  } catch (_error) {
    // Try python -m pipx (pipx may be installed but not on PATH)
  }

  const pythonCmd = getPythonCommand();
  try {
    await execa(pythonCmd, ['-m', 'pipx', '--version']);
    spinner.succeed('pipx found');
    return { kind: 'python-module', pythonCmd };
  } catch (_error) {
    // Continue to interactive flow below.
  }

  if (yes) {
    throw new PipxNotFoundError();
  }

  const { installPipx } = (await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installPipx',
      message: 'pipx is not installed. Install it now (user install via python -m pip)?',
      default: true,
    },
  ])) as { installPipx: boolean };

  if (!installPipx) {
    throw new PipxNotFoundError();
  }

  spinner.start('Installing pipx (user install)');
  try {
    // Best-effort: upgrade pip first, then install pipx.
    try {
      await execa(pythonCmd, ['-m', 'pip', 'install', '--user', '--upgrade', 'pip']);
    } catch (_pipUpgradeError) {
      // Ignore pip upgrade issues.
    }
    await execa(pythonCmd, ['-m', 'pip', 'install', '--user', '--upgrade', 'pipx']);
  } catch (error: unknown) {
    const err = error as { stderr?: unknown; shortMessage?: unknown; message?: unknown };
    const msg = String(err?.stderr || err?.shortMessage || err?.message || '');
    throw new InstallationError(
      'Install pipx with python -m pip',
      error instanceof Error ? error : new Error(msg)
    );
  }
  spinner.succeed('pipx installed');

  ensureUserLocalBinOnPath();
  try {
    await execa(pythonCmd, ['-m', 'pipx', '--version']);
    return { kind: 'python-module', pythonCmd };
  } catch (error: unknown) {
    const err = error as { stderr?: unknown; shortMessage?: unknown; message?: unknown };
    const msg = String(
      err?.stderr || err?.shortMessage || err?.message || 'pipx not runnable after install'
    );
    throw new InstallationError(
      'Verify pipx after install',
      new Error(`${msg}\n\nTry reopening your terminal or run: python3 -m pipx ensurepath`)
    );
  }
}

async function execaPipx(invoker: PipxInvoker, args: string[]) {
  if (invoker.kind === 'binary') {
    return execa('pipx', args);
  }
  return execa(invoker.pythonCmd, ['-m', 'pipx', ...args]);
}

async function ensurePoetryAvailable(spinner: Ora, yes: boolean): Promise<void> {
  ensureUserLocalBinOnPath();

  spinner.start('Checking Poetry installation');
  try {
    await execa('poetry', ['--version']);
    spinner.succeed('Poetry found');
    return;
  } catch (_error) {
    // Continue to interactive flow below.
  }

  if (yes) {
    throw new PoetryNotFoundError();
  }

  const { installPoetry } = (await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installPoetry',
      message: 'Poetry is not installed. Install it now using pipx?',
      default: true,
    },
  ])) as { installPoetry: boolean };

  if (!installPoetry) {
    throw new PoetryNotFoundError();
  }

  const pipx = await ensurePipxAvailable(spinner, yes);

  spinner.start('Installing Poetry with pipx');
  try {
    await execaPipx(pipx, ['install', 'poetry']);
  } catch (error: unknown) {
    const err = error as { stderr?: unknown; shortMessage?: unknown; message?: unknown };
    const msg = String(err?.stderr || err?.shortMessage || err?.message || '');
    // If it's already installed, attempt an upgrade; otherwise treat as a hard failure.
    if (/already\s+installed|already\s+seems\s+to\s+be\s+installed|exists/i.test(msg)) {
      try {
        await execaPipx(pipx, ['upgrade', 'poetry']);
      } catch (_upgradeError) {
        // ignore upgrade errors; we just need a working poetry
      }
    } else {
      throw new InstallationError(
        'Install Poetry with pipx',
        error instanceof Error ? error : new Error(msg)
      );
    }
  }
  spinner.succeed('Poetry installed');

  ensureUserLocalBinOnPath();
  try {
    await execa('poetry', ['--version']);
  } catch (error: unknown) {
    const err = error as { stderr?: unknown; shortMessage?: unknown; message?: unknown };
    const msg = String(
      err?.stderr || err?.shortMessage || err?.message || 'Poetry not found on PATH'
    );
    throw new InstallationError(
      'Verify Poetry after pipx install',
      new Error(
        `${msg}\n\nPoetry may be installed but not on PATH yet. Try reopening your terminal or run: pipx ensurepath`
      )
    );
  }
}

function workspaceLauncherSh(installMethod: InstallMethod): string {
  // Intentionally avoid calling bare `rapidkit` to prevent recursion into the npm wrapper.
  // Prefer the in-workspace venv when present, otherwise fall back to `poetry run rapidkit`.
  const allowPoetry = installMethod === 'poetry';
  return `#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

VENV_RAPIDKIT="$SCRIPT_DIR/.venv/bin/rapidkit"
if [ -x "$VENV_RAPIDKIT" ]; then
  exec "$VENV_RAPIDKIT" "$@"
fi

${
  allowPoetry
    ? `if command -v poetry >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/pyproject.toml" ]; then
  exec poetry run rapidkit "$@"
fi

`
    : ''
}echo "RapidKit launcher could not find a local Python CLI." 1>&2
echo "- If you used venv: ensure .venv exists (or re-run the installer)." 1>&2
${
  allowPoetry
    ? `echo "- If you used Poetry: run 'poetry install' and retry, or activate the env." 1>&2
`
    : ''
}echo "Tip: you can also run: ./.venv/bin/rapidkit --help" 1>&2
exit 1
`;
}

function workspaceLauncherCmd(installMethod: InstallMethod): string {
  const allowPoetry = installMethod === 'poetry';
  // Windows launcher: prefer in-project venv, else fall back to Poetry.
  return `@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

if exist "%SCRIPT_DIR%\\.venv\\Scripts\\rapidkit.exe" (
  "%SCRIPT_DIR%\\.venv\\Scripts\\rapidkit.exe" %*
  exit /b %ERRORLEVEL%
)

${
  allowPoetry
    ? `where poetry >nul 2>nul
if %ERRORLEVEL%==0 if exist "%SCRIPT_DIR%\\pyproject.toml" (
  poetry run rapidkit %*
  exit /b %ERRORLEVEL%
)

`
    : ''
}echo RapidKit launcher could not find a local Python CLI. 1>&2
echo Tip: run .venv\\Scripts\\rapidkit.exe --help 1>&2
exit /b 1
`;
}

async function writeWorkspaceLauncher(
  workspacePath: string,
  installMethod: InstallMethod
): Promise<void> {
  // Always create the launcher; it degrades gracefully for pipx installs.
  await fsExtra.outputFile(
    path.join(workspacePath, 'rapidkit'),
    workspaceLauncherSh(installMethod),
    { encoding: 'utf-8', mode: 0o755 }
  );
  await fsExtra.outputFile(
    path.join(workspacePath, 'rapidkit.cmd'),
    workspaceLauncherCmd(installMethod),
    'utf-8'
  );
}

interface CreateProjectOptions {
  skipGit?: boolean;
  testMode?: boolean;
  demoMode?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  userConfig?: UserConfig;
  installMethod?: InstallMethod;
}

export async function createProject(
  projectName: string | undefined,
  options: CreateProjectOptions
) {
  // Existing directories cannot be registered as a workspace via createProject. If callers need
  // to register the current directory as a workspace (e.g., when creating a project outside a
  // workspace) use `registerWorkspaceAtPath` instead.

  const {
    skipGit = false,
    testMode = false,
    demoMode = false,
    dryRun = false,
    yes = false,
    userConfig = {},
    installMethod: providedInstallMethod,
  } = options;

  // Default to 'rapidkit' directory
  const name = projectName || 'rapidkit';
  const projectPath = path.resolve(process.cwd(), name);

  // Check if directory exists
  if (await fsExtra.pathExists(projectPath)) {
    throw new DirectoryExistsError(name);
  }

  // Dry-run mode - show what would be created
  if (dryRun) {
    await showDryRun(projectPath, name, demoMode, userConfig);
    return;
  }

  // Demo mode - create workspace with demo kit setup script
  if (demoMode) {
    await createDemoWorkspace(projectPath, name, skipGit);
    return;
  }

  // Step 1: Choose Python version and install method (or auto-select with --yes)
  const pythonAnswers: { pythonVersion: string; installMethod: InstallMethod } = yes
    ? {
        pythonVersion: userConfig.pythonVersion || '3.10',
        // Prefer CLI flag, then user config, then default to poetry (recommended).
        installMethod:
          providedInstallMethod ||
          (userConfig.defaultInstallMethod as InstallMethod | undefined) ||
          'poetry',
      }
    : ((await inquirer.prompt([
        {
          type: 'list',
          name: 'pythonVersion',
          message: 'Select Python version for RapidKit:',
          choices: ['3.10', '3.11', '3.12'],
          default: userConfig.pythonVersion || '3.10',
        },
        {
          type: 'list',
          name: 'installMethod',
          message: 'How would you like to install RapidKit?',
          choices: [
            { name: '🎯 Poetry (Recommended - includes virtual env)', value: 'poetry' },
            { name: '📦 pip with venv (Standard)', value: 'venv' },
            { name: '🔧 pipx (Global isolated install)', value: 'pipx' },
          ],
          // Poetry is recommended as default
          default: userConfig.defaultInstallMethod || 'poetry',
        },
      ])) as { pythonVersion: string; installMethod: InstallMethod });

  logger.step(1, 3, 'Setting up RapidKit environment');
  const spinner = ora('Creating directory').start();

  try {
    // Create directory
    await fsExtra.ensureDir(projectPath);
    spinner.succeed('Directory created');

    // Detect actual Python version before installation
    spinner.start('Detecting Python version');
    let actualPythonVersion: string | null = null;
    const realPython = await findRealPython(pythonAnswers.pythonVersion);
    if (realPython) {
      actualPythonVersion = await detectActualPythonVersion(realPython);
      if (actualPythonVersion) {
        logger.info(` Detected Python ${actualPythonVersion}`);
        spinner.succeed(`Python ${actualPythonVersion} detected`);
      } else {
        spinner.warn('Could not detect exact Python version');
      }
    } else {
      // Fallback to getPythonCommand
      const pythonCmd = getPythonCommand();
      actualPythonVersion = await detectActualPythonVersion(pythonCmd);
      if (actualPythonVersion) {
        spinner.succeed(`Python ${actualPythonVersion} detected`);
      } else {
        spinner.warn('Could not detect Python version, proceeding with defaults');
      }
    }

    // Create workspace marker with actual Python version
    await writeWorkspaceMarker(
      projectPath,
      name,
      pythonAnswers.installMethod,
      actualPythonVersion || undefined
    );

    // Write .python-version file for pyenv compatibility
    if (actualPythonVersion) {
      await writePythonVersion(projectPath, actualPythonVersion);
    }

    // Create .gitignore regardless of git initialization (matches VS Code extension behavior).
    await writeWorkspaceGitignore(projectPath);

    // Install RapidKit based on method
    if (pythonAnswers.installMethod === 'poetry') {
      try {
        await installWithPoetry(
          projectPath,
          pythonAnswers.pythonVersion,
          spinner,
          testMode,
          userConfig,
          yes
        );
      } catch (poetryError: unknown) {
        // If Poetry fails due to pyenv shim issues, try venv as fallback
        const errorDetails =
          (poetryError as Error & { details?: string })?.details ||
          (poetryError as Error)?.message ||
          String(poetryError);
        const isShimError =
          errorDetails.includes('pyenv') ||
          errorDetails.includes('exit status 127') ||
          errorDetails.includes('returned non-zero exit status 127');

        if (isShimError) {
          spinner.warn('Poetry encountered Python discovery issues, trying venv method');
          logger.debug(`Poetry error (attempting venv fallback): ${errorDetails}`);

          try {
            await installWithVenv(
              projectPath,
              pythonAnswers.pythonVersion,
              spinner,
              testMode,
              userConfig
            );
            // Update the marker to reflect actual install method
            pythonAnswers.installMethod = 'venv';
          } catch (venvError) {
            // Both methods failed - throw the venv error as it's more recent
            throw venvError;
          }
        } else {
          throw poetryError;
        }
      }
    } else if (pythonAnswers.installMethod === 'venv') {
      await installWithVenv(
        projectPath,
        pythonAnswers.pythonVersion,
        spinner,
        testMode,
        userConfig
      );
    } else {
      await installWithPipx(projectPath, spinner, testMode, userConfig, yes);
    }

    // Create a local launcher so users can run RapidKit without activating the env.
    await writeWorkspaceLauncher(projectPath, pythonAnswers.installMethod);

    // Create README with instructions
    await createReadme(projectPath, pythonAnswers.installMethod);

    spinner.succeed('RapidKit environment ready!');

    // Git initialization
    if (!options.skipGit) {
      spinner.start('Initializing git repository');
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit: RapidKit environment'], {
          cwd: projectPath,
        });
        spinner.succeed('Git repository initialized');
      } catch (_error) {
        spinner.warn('Could not initialize git repository');
      }
    }

    // Register workspace in shared registry for Extension compatibility
    try {
      const { registerWorkspace } = await import('./workspace.js');
      await registerWorkspace(projectPath, name);
    } catch (_err) {
      // Silent fail - registry is optional, but log warning
      console.warn(chalk.gray('Note: Could not register workspace in shared registry'));
    }

    // Success message
    console.log(chalk.green('\n✨ RapidKit environment created successfully!\n'));
    console.log(chalk.cyan('📂 Location:'), chalk.white(projectPath));
    console.log(chalk.cyan('🚀 Get started:\n'));
    console.log(chalk.white(`   cd ${name}`));

    if (pythonAnswers.installMethod === 'poetry') {
      // Check Poetry version for activation command
      let activateCmd = 'source $(poetry env info --path)/bin/activate';
      try {
        ensureUserLocalBinOnPath();
        const { stdout } = await execa('poetry', ['--version']);
        const versionMatch = stdout.match(/Poetry.*?(\d+)\.(\d+)/);
        if (versionMatch) {
          const majorVersion = parseInt(versionMatch[1]);
          if (majorVersion >= 2) {
            // Poetry 2.0+: use env activate
            activateCmd = 'source $(poetry env info --path)/bin/activate';
          } else {
            // Poetry 1.x: use shell
            activateCmd = 'poetry shell';
          }
        }
      } catch (_error) {
        // Default to Poetry 2.0+ syntax
      }

      console.log(chalk.white(`   ${activateCmd}  # Or: poetry run rapidkit`));
      console.log(chalk.white('   rapidkit create  # Interactive mode'));
      console.log(chalk.white('   cd <project-name> && rapidkit init && rapidkit dev'));
    } else if (pythonAnswers.installMethod === 'venv') {
      console.log(
        chalk.white('   source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate')
      );
      console.log(chalk.white('   rapidkit create  # Interactive mode'));
      console.log(chalk.white('   cd <project-name> && rapidkit init && rapidkit dev'));
    } else {
      console.log(chalk.white('   rapidkit create  # Interactive mode'));
      console.log(chalk.white('   cd <project-name> && rapidkit init && rapidkit dev'));
    }

    console.log(chalk.white('\n💡 For more information, check the README.md file.'));
    console.log(chalk.cyan('\n📚 RapidKit commands:'));
    console.log(chalk.white('   rapidkit create          - Create a new project (interactive)'));
    console.log(chalk.white('   rapidkit dev             - Run development server'));
    console.log(chalk.white('   rapidkit add module <name> - Add a module (e.g., settings)'));
    console.log(chalk.white('   rapidkit list            - List available kits'));
    console.log(chalk.white('   rapidkit modules         - List available modules'));
    console.log(chalk.white('   rapidkit --help          - Show all commands\n'));

    // Go toolchain check — informational note for gofiber.standard projects
    try {
      const { stdout: goOut } = await execa('go', ['version'], { timeout: 3000 });
      const goMatch = goOut.match(/go version go(\d+\.\d+(?:\.\d+)?)/);
      const goVer = goMatch ? goMatch[1] : 'unknown';
      console.log(
        chalk.gray(`🐹 Go toolchain: Go ${goVer} detected — ready for gofiber.standard projects`)
      );
    } catch {
      console.log(
        chalk.yellow('⚠️  Go toolchain not installed — needed for gofiber.standard projects')
      );
      console.log(chalk.gray('   Install: https://go.dev/dl/'));
    }
    console.log('');
  } catch (_error) {
    spinner.fail('Failed to create RapidKit environment');
    console.error(chalk.red('\n❌ Error:'), _error);

    // Cleanup on failure
    try {
      await fsExtra.remove(projectPath);
    } catch (_cleanupError) {
      // Ignore cleanup errors
    }

    // Re-throw the error for callers to handle (e.g., tests and CLI error handlers)
    throw _error;
  }
}

// Find real Python executable (bypass pyenv shims that might fail)
async function findRealPython(pythonVersion: string): Promise<string | null> {
  // Try multiple strategies to find a working Python
  const candidates: string[] = [];

  // 1. Try pyenv versions directly (bypass shims)
  try {
    const { stdout } = await execa('pyenv', ['root']);
    const pyenvRoot = stdout.trim();
    // Try specific version first
    candidates.push(path.join(pyenvRoot, 'versions', `${pythonVersion}.*`, 'bin', 'python'));
    // Try major.minor pattern
    const [major, minor] = pythonVersion.split('.');
    candidates.push(path.join(pyenvRoot, 'versions', `${major}.${minor}.*`, 'bin', 'python'));
  } catch {
    // pyenv not available or failed
  }

  // 2. Try direct python commands
  candidates.push(
    `python${pythonVersion}`,
    `python3.${pythonVersion.split('.')[1]}`,
    'python3',
    'python'
  );

  // 3. Try common installation paths
  candidates.push(
    `/usr/bin/python${pythonVersion}`,
    `/usr/bin/python3`,
    `/usr/local/bin/python${pythonVersion}`,
    `/usr/local/bin/python3`
  );

  // Test each candidate
  for (const candidate of candidates) {
    try {
      // Expand glob if present
      let pythonPath = candidate;
      if (candidate.includes('*')) {
        const globMatch = await execa('sh', ['-c', `ls -d ${candidate} 2>/dev/null | head -1`]);
        pythonPath = globMatch.stdout.trim();
        if (!pythonPath) continue;
        pythonPath = path.join(pythonPath.split('/').slice(0, -1).join('/'), '../bin/python');
      }

      const { stdout } = await execa(pythonPath, ['--version'], { timeout: 2000 });
      const version = stdout.match(/Python (\d+\.\d+)/)?.[1];
      if (version && parseFloat(version) >= parseFloat(pythonVersion)) {
        // Verify this Python actually works (not a broken shim)
        await execa(pythonPath, ['-c', 'import sys; sys.exit(0)'], { timeout: 2000 });
        return pythonPath;
      }
    } catch {
      continue;
    }
  }

  return null;
}

// Install RapidKit with Poetry
async function installWithPoetry(
  projectPath: string,
  pythonVersion: string,
  spinner: Ora,
  testMode?: boolean,
  userConfig?: UserConfig,
  yes = false
) {
  await ensurePoetryAvailable(spinner, yes);

  // Find a working Python before initializing Poetry
  spinner.start('Finding Python interpreter');
  const realPython = await findRealPython(pythonVersion);
  if (realPython) {
    logger.debug(`Found working Python: ${realPython}`);
    spinner.succeed('Python found');
  } else {
    spinner.warn('Could not verify Python path, proceeding with default');
  }

  spinner.start('Initializing Poetry project');
  await execa('poetry', ['init', '--no-interaction', '--python', `^${pythonVersion}`], {
    cwd: projectPath,
  });

  spinner.succeed('Poetry project initialized');

  // Set package-mode = false since this is a workspace, not a package
  // Poetry 2.2+ uses PEP 621 format with [project] instead of [tool.poetry]
  const pyprojectPath = path.join(projectPath, 'pyproject.toml');
  const pyprojectContent = await fsPromises.readFile(pyprojectPath, 'utf-8');

  let updatedContent = pyprojectContent;

  // Try to add package-mode = false in the right place
  if (updatedContent.includes('[tool.poetry]')) {
    // Old format - add after [tool.poetry]
    updatedContent = updatedContent.replace('[tool.poetry]', '[tool.poetry]\npackage-mode = false');
  } else if (updatedContent.includes('[project]')) {
    // New PEP 621 format - add before [build-system]
    if (updatedContent.includes('[build-system]')) {
      updatedContent = updatedContent.replace(
        '[build-system]',
        '\n[tool.poetry]\npackage-mode = false\n\n[build-system]'
      );
    } else {
      // Add at the end if no build-system section
      updatedContent += '\n\n[tool.poetry]\npackage-mode = false\n';
    }
  }

  await fsPromises.writeFile(pyprojectPath, updatedContent, 'utf-8');

  // Configure Poetry to use the real Python we found and create in-project virtualenv
  spinner.start('Configuring Poetry');
  try {
    // Use --local to avoid affecting global Poetry config
    await execa('poetry', ['config', 'virtualenvs.in-project', 'true', '--local'], {
      cwd: projectPath,
    });

    // If we found a specific Python, tell Poetry to use it
    if (realPython) {
      try {
        await execa('poetry', ['env', 'use', realPython], { cwd: projectPath });
        logger.debug(`Poetry configured to use: ${realPython}`);
      } catch (envError) {
        // Non-fatal - Poetry will use its default Python discovery
        logger.debug(`Could not set Poetry env to ${realPython}: ${envError}`);
      }
    }
    spinner.succeed('Poetry configured');
  } catch (_error) {
    // Not a fatal error; continue with installation. Some Poetry versions or environments may not support this.
    spinner.warn('Could not configure Poetry virtualenvs.in-project');
  }

  // Create the virtualenv first with poetry install (this ensures in-project venv is created)
  spinner.start('Creating virtualenv');
  try {
    await execa('poetry', ['install', '--no-root'], { cwd: projectPath, timeout: 30000 });
    spinner.succeed('Virtualenv created');
  } catch (venvError) {
    logger.debug(`Failed to create virtualenv: ${venvError}`);
    spinner.warn('Could not create virtualenv, proceeding with add command');
  }

  spinner.start('Installing RapidKit');
  if (testMode) {
    // Test mode: Install from local path (configured via environment or config file)
    const localPath = getTestRapidKitPath(userConfig || {});
    if (!localPath) {
      throw new InstallationError(
        'Test mode installation',
        new Error('No local RapidKit path configured. Set RAPIDKIT_DEV_PATH environment variable.')
      );
    }
    logger.debug(`Installing from local path: ${localPath}`);
    spinner.text = 'Installing RapidKit from local path (test mode)';
    await execa('poetry', ['add', localPath], { cwd: projectPath });
  } else {
    // Production: Install from PyPI
    spinner.text = 'Installing RapidKit from PyPI';

    let installSuccess = false;
    let lastError: unknown = null;

    // Try up to 3 times with increasing timeouts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await execa('poetry', ['add', 'rapidkit-core'], {
          cwd: projectPath,
          timeout: 60000 * attempt, // 60s, 120s, 180s
        });
        installSuccess = true;
        break;
      } catch (error) {
        lastError = error;
        logger.debug(`Poetry add attempt ${attempt} failed: ${error}`);

        if (attempt < 3) {
          spinner.text = `Retrying installation (attempt ${attempt + 1}/3)`;
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s between retries
        }
      }
    }

    if (!installSuccess) {
      // All attempts failed - provide helpful error
      const errorMsg =
        (lastError as Error & { stderr?: string })?.stderr ||
        (lastError as Error)?.message ||
        'Unknown error';
      logger.debug(`All Poetry install attempts failed. Last error: ${errorMsg}`);

      // Check if it's a network/PyPI issue vs other issues
      if (errorMsg.includes('Could not find') || errorMsg.includes('No matching distribution')) {
        throw new RapidKitNotAvailableError();
      } else {
        throw new InstallationError(
          'Install rapidkit-core with Poetry',
          new Error(
            `Failed to install rapidkit-core after 3 attempts.\n` +
              `Error: ${errorMsg}\n\n` +
              `Possible solutions:\n` +
              `  1. Check your internet connection\n` +
              `  2. Try installing manually: cd ${path.basename(projectPath)} && poetry add rapidkit-core\n` +
              `  3. Use venv method instead: npx rapidkit ${path.basename(projectPath)} --install-method=venv`
          )
        );
      }
    }
  }
  spinner.succeed('RapidKit installed in project virtualenv');

  // Also install globally with pipx for CLI access
  try {
    const { checkRapidkitCoreAvailable } = await import('./core-bridge/pythonRapidkitExec.js');
    const isGloballyAvailable = await checkRapidkitCoreAvailable();

    if (!isGloballyAvailable && !testMode) {
      spinner.start('Installing RapidKit globally with pipx for CLI access');
      const pipx = await ensurePipxAvailable(spinner, yes);
      try {
        await execaPipx(pipx, ['install', 'rapidkit-core']);
        spinner.succeed('RapidKit installed globally');
      } catch (pipxError) {
        // Not fatal - project virtualenv has it
        spinner.warn('Could not install globally (non-fatal, project virtualenv has RapidKit)');
        logger.debug(`pipx install failed: ${pipxError}`);
      }
    }
  } catch (checkError) {
    // Non-fatal - just skip global install
    logger.debug(`Global install check skipped: ${checkError}`);
  }
}

// Install RapidKit with venv + pip
async function installWithVenv(
  projectPath: string,
  pythonVersion: string,
  spinner: Ora,
  testMode?: boolean,
  userConfig?: UserConfig,
  yes = false
) {
  spinner.start(`Checking Python ${pythonVersion}`);

  const pythonCmd = getPythonCommand();
  try {
    const { stdout } = await execa(pythonCmd, ['--version']);
    const version = stdout.match(/Python (\d+\.\d+)/)?.[1];

    if (version && parseFloat(version) < parseFloat(pythonVersion)) {
      throw new PythonNotFoundError(pythonVersion, version);
    }

    spinner.succeed(`Python ${version} found`);
  } catch (_error) {
    if (_error instanceof PythonNotFoundError) {
      throw _error;
    }
    throw new PythonNotFoundError(pythonVersion);
  }

  spinner.start('Creating virtual environment');
  try {
    await execa(pythonCmd, ['-m', 'venv', '.venv'], { cwd: projectPath });
    spinner.succeed('Virtual environment created');
  } catch (venvError: unknown) {
    spinner.fail('Failed to create virtual environment');

    // Type guard: check if error has stdout property (from execa)
    const hasStdout = (err: unknown): err is { stdout: string } => {
      return (
        typeof err === 'object' &&
        err !== null &&
        'stdout' in err &&
        typeof (err as Record<string, unknown>).stdout === 'string'
      );
    };

    // Check if it's the ensurepip issue
    if (hasStdout(venvError) && venvError.stdout.includes('ensurepip is not')) {
      const match = venvError.stdout.match(/apt install (python[\d.]+-venv)/);
      const packageName = match ? match[1] : 'python3-venv';

      throw new InstallationError(
        'Python venv module not available',
        new Error(
          `Virtual environment creation failed.\n\n` +
            `On Debian/Ubuntu systems, install the venv package:\n` +
            `  sudo apt install ${packageName}\n\n` +
            `Or use Poetry instead (recommended):\n` +
            `  npx rapidkit ${path.basename(projectPath)} --yes`
        )
      );
    }

    // Other venv errors
    throw new InstallationError(
      'Virtual environment creation',
      venvError instanceof Error ? venvError : new Error(String(venvError))
    );
  }

  spinner.start('Installing RapidKit');
  // Use python -m pip for cross-platform compatibility.
  // Windows 25.0+ requires this instead of calling pip.exe directly.
  const venvPython = path.join(
    projectPath,
    '.venv',
    process.platform === 'win32' ? 'Scripts' : 'bin',
    process.platform === 'win32' ? 'python.exe' : 'python'
  );

  await execa(venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip'], { cwd: projectPath });

  if (testMode) {
    // Test mode: Install from local path (configured via environment or config file)
    const localPath = getTestRapidKitPath(userConfig || {});
    if (!localPath) {
      throw new InstallationError(
        'Test mode installation',
        new Error('No local RapidKit path configured. Set RAPIDKIT_DEV_PATH environment variable.')
      );
    }
    logger.debug(`Installing from local path: ${localPath}`);
    spinner.text = 'Installing RapidKit from local path (test mode)';
    await execa(venvPython, ['-m', 'pip', 'install', '-e', localPath], { cwd: projectPath });
  } else {
    // Production: Install from PyPI
    spinner.text = 'Installing RapidKit from PyPI';

    let installSuccess = false;
    let lastError: unknown = null;

    // Try up to 3 times with increasing timeouts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await execa(venvPython, ['-m', 'pip', 'install', 'rapidkit-core'], {
          cwd: projectPath,
          timeout: 60000 * attempt, // 60s, 120s, 180s
        });
        installSuccess = true;
        break;
      } catch (error) {
        lastError = error;
        logger.debug(`pip install attempt ${attempt} failed: ${error}`);

        if (attempt < 3) {
          spinner.text = `Retrying installation (attempt ${attempt + 1}/3)`;
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s between retries
        }
      }
    }

    if (!installSuccess) {
      // All attempts failed
      const errorMsg =
        (lastError as Error & { stderr?: string })?.stderr ||
        (lastError as Error)?.message ||
        'Unknown error';
      logger.debug(`All pip install attempts failed. Last error: ${errorMsg}`);

      if (errorMsg.includes('Could not find') || errorMsg.includes('No matching distribution')) {
        throw new RapidKitNotAvailableError();
      } else {
        throw new InstallationError(
          'Install rapidkit-core with pip',
          new Error(
            `Failed to install rapidkit-core after 3 attempts.\n` +
              `Error: ${errorMsg}\n\n` +
              `Possible solutions:\n` +
              `  1. Check your internet connection\n` +
              `  2. Try installing manually: cd ${path.basename(projectPath)} && .venv/bin/python -m pip install rapidkit-core\n` +
              `  3. Use Poetry instead: npx rapidkit ${path.basename(projectPath)} --install-method=poetry`
          )
        );
      }
    }
  }
  spinner.succeed('RapidKit installed in project virtualenv');

  // Also install globally with pipx for CLI access
  try {
    const { checkRapidkitCoreAvailable } = await import('./core-bridge/pythonRapidkitExec.js');
    const isGloballyAvailable = await checkRapidkitCoreAvailable();

    if (!isGloballyAvailable && !testMode) {
      spinner.start('Installing RapidKit globally with pipx for CLI access');
      const pipx = await ensurePipxAvailable(spinner, yes);
      try {
        await execaPipx(pipx, ['install', 'rapidkit-core']);
        spinner.succeed('RapidKit installed globally');
      } catch (pipxError) {
        // Not fatal - project virtualenv has it
        spinner.warn('Could not install globally (non-fatal, project virtualenv has RapidKit)');
        logger.debug(`pipx install failed: ${pipxError}`);
      }
    }
  } catch (checkError) {
    // Non-fatal - just skip global install
    logger.debug(`Global install check skipped: ${checkError}`);
  }
}

// Install RapidKit with pipx (global)
async function installWithPipx(
  projectPath: string,
  spinner: Ora,
  testMode?: boolean,
  userConfig?: UserConfig,
  yes = false
) {
  const pipx = await ensurePipxAvailable(spinner, yes);

  spinner.start('Installing RapidKit globally with pipx');
  if (testMode) {
    // Test mode: Install from local path (configured via environment or config file)
    const localPath = getTestRapidKitPath(userConfig || {});
    if (!localPath) {
      throw new InstallationError(
        'Test mode installation',
        new Error('No local RapidKit path configured. Set RAPIDKIT_DEV_PATH environment variable.')
      );
    }
    logger.debug(`Installing from local path: ${localPath}`);
    spinner.text = 'Installing RapidKit from local path (test mode)';
    await execaPipx(pipx, ['install', '-e', localPath]);
  } else {
    // Production: Install from PyPI
    spinner.text = 'Installing RapidKit from PyPI';
    try {
      await execaPipx(pipx, ['install', 'rapidkit-core']);
    } catch (_error) {
      // pipx failed to install - could be network, PyPI availability, etc.
      throw new RapidKitNotAvailableError();
    }
  }
  spinner.succeed('RapidKit installed globally');

  // Create a simple marker file
  await fsExtra.outputFile(
    path.join(projectPath, '.rapidkit-global'),
    'RapidKit installed globally with pipx\n',
    'utf-8'
  );
}

// Register an existing directory as a RapidKit workspace and install the engine.
export async function registerWorkspaceAtPath(
  workspacePath: string,
  options?: {
    skipGit?: boolean;
    testMode?: boolean;
    userConfig?: UserConfig;
    yes?: boolean;
    installMethod?: InstallMethod;
    pythonVersion?: string;
  }
) {
  const {
    skipGit = false,
    testMode = false,
    userConfig = {},
    yes = false,
    installMethod,
    pythonVersion = '3.10',
  } = options || {};

  // Choose install method (Poetry is now default, recommended)
  const method: InstallMethod =
    (installMethod as InstallMethod) ||
    (userConfig.defaultInstallMethod as InstallMethod) ||
    'poetry';

  // Create marker and gitignore
  await writeWorkspaceMarker(workspacePath, path.basename(workspacePath), method);
  await writeWorkspaceGitignore(workspacePath);

  const spinner = ora('Registering workspace').start();

  try {
    if (method === 'poetry') {
      await installWithPoetry(workspacePath, pythonVersion, spinner, testMode, userConfig, yes);
    } else if (method === 'venv') {
      await installWithVenv(workspacePath, pythonVersion, spinner, testMode, userConfig);
    } else {
      await installWithPipx(workspacePath, spinner, testMode, userConfig, yes);
    }

    await writeWorkspaceLauncher(workspacePath, method);
    await createReadme(workspacePath, method);

    spinner.succeed('Workspace registered');

    // Register in shared registry for Extension compatibility
    try {
      const { registerWorkspace } = await import('./workspace.js');
      await registerWorkspace(workspacePath, path.basename(workspacePath));
    } catch (_err) {
      // Silent fail - registry is optional
    }

    if (!skipGit) {
      spinner.start('Initializing git repository');
      try {
        await execa('git', ['init'], { cwd: workspacePath });
        await execa('git', ['add', '.'], { cwd: workspacePath });
        await execa('git', ['commit', '-m', 'Initial commit: RapidKit workspace'], {
          cwd: workspacePath,
        });
        spinner.succeed('Git repository initialized');
      } catch (_error) {
        spinner.warn('Could not initialize git repository');
      }
    }
  } catch (e) {
    spinner.fail('Failed to register workspace');
    throw e;
  }
}

// Create README with usage instructions
async function createReadme(projectPath: string, installMethod: string) {
  const activationCmd =
    installMethod === 'poetry'
      ? 'source $(poetry env info --path)/bin/activate\n# Or simply use: poetry run rapidkit <command>'
      : installMethod === 'venv'
        ? 'source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate'
        : 'N/A (globally installed)';

  const noActivateCmd =
    installMethod === 'poetry'
      ? '# No activation needed (recommended):\n./rapidkit --help\n# or:\npoetry run rapidkit --help'
      : installMethod === 'venv'
        ? '# No activation needed (recommended):\n./rapidkit --help\n# or direct:\n./.venv/bin/rapidkit --help'
        : '# Optional: use the local launcher\n./rapidkit --help\n# (pipx installs may require Poetry/venv to be present in this folder)';

  const readmeContent = `# RapidKit Workspace

This directory contains a RapidKit development environment.

## Installation Method

**${installMethod === 'poetry' ? 'Poetry' : installMethod === 'venv' ? 'Python venv + pip' : 'pipx (global)'}**

## Getting Started

### 0. Run Without Activation (Recommended)

This workspace includes a local launcher script so you can run the Python Core CLI without activating the environment:

\`\`\`bash
${noActivateCmd}
\`\`\`

### 1. Activate Environment

\`\`\`bash
${activationCmd}
\`\`\`

### 2. Create Your First Project

\`\`\`bash
# Interactive mode (recommended):
rapidkit create
# Follow the prompts to choose kit and project name

# Or specify directly:
rapidkit create project fastapi.standard my-project

# With poetry run (no activation needed):
poetry run rapidkit create
\`\`\`

Interactive mode will guide you through selecting a kit and configuring your project.

### 3. Navigate and Run

\`\`\`bash
cd my-project
# Install dependencies (preferred):
rapidkit init

# Run the server (project-aware):
rapidkit dev

# Or with poetry run (manual / advanced):
poetry run rapidkit dev

# Or manually:
uvicorn src.main:app --reload
\`\`\`

### 4. Add Modules (Optional)

\`\`\`bash
# Add common modules to your project:
rapidkit add module settings
rapidkit add module logging
rapidkit add module database

# List available modules:
rapidkit modules list
\`\`\`

## Available Commands

- \`rapidkit create\` - Create a new project (interactive)
- \`rapidkit create project <kit> <name>\` - Create project with specific kit
- \`rapidkit dev\` - Run development server
- \`rapidkit add module <name>\` - Add a module (e.g., \`rapidkit add module settings\`)
- \`rapidkit list\` - List available kits
- \`rapidkit modules\` - List available modules
- \`rapidkit upgrade\` - Upgrade RapidKit
- \`rapidkit doctor\` - Check system requirements
- \`rapidkit --help\` - Show all commands

## RapidKit Documentation

For full documentation, visit: [RapidKit Docs](https://getrapidkit.com) *(or appropriate URL)*

## Workspace Structure

\`\`\`
${installMethod === 'venv' ? '.venv/          # Python virtual environment' : ''}
${installMethod === 'poetry' ? 'pyproject.toml  # Poetry configuration' : ''}
my-project/     # Your RapidKit projects go here
README.md       # This file
\`\`\`

## Troubleshooting

If you encounter issues:

1. Ensure Python 3.10+ is installed: \`python3 --version\`
2. Check RapidKit installation: \`rapidkit --version\`
3. Run diagnostics: \`rapidkit doctor\`
4. Visit RapidKit documentation or GitHub issues
`;
  await fsPromises.writeFile(path.join(projectPath, 'README.md'), readmeContent, 'utf-8');
}

/**
 * Create a demo workspace with kit templates (no Python installation)
 */
async function createDemoWorkspace(
  projectPath: string,
  name: string,
  skipGit: boolean
): Promise<void> {
  const spinner = ora('Creating demo workspace').start();

  try {
    // Create directory
    await fsExtra.ensureDir(projectPath);
    spinner.succeed('Directory created');

    // Create a simple CLI script for generating demo projects
    spinner.start('Setting up demo kit generator');

    const packageJsonContent = JSON.stringify(
      {
        name: `${name}-workspace`,
        version: '1.0.0',
        private: true,
        description: 'RapidKit demo workspace',
        scripts: {
          generate: 'node generate-demo.js',
        },
      },
      null,
      2
    );

    await fsPromises.writeFile(path.join(projectPath, 'package.json'), packageJsonContent, 'utf-8');

    const generateScriptContent = `#!/usr/bin/env node
/**
 * Demo Kit Generator - Create FastAPI demo projects
 * 
 * This workspace contains bundled RapidKit templates that you can use
 * to generate demo projects without installing Python RapidKit.
 * 
 * Usage:
 *   npm run generate <project-name>
 *   node generate-demo.js <project-name>
 * 
 * Example:
 *   npm run generate my-api
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const projectName = process.argv[2];

if (!projectName) {
  console.error('\\n❌ Please provide a project name');
  console.log('\\nUsage: npm run generate <project-name>\\n');
  console.log('Example: npm run generate my-api\\n');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(\`\${question} (\${defaultValue}): \`, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

async function main() {
  const targetPath = path.join(process.cwd(), projectName);
  
  if (fs.existsSync(targetPath)) {
    console.error(\`\\n❌ Directory "\${projectName}" already exists\\n\`);
    process.exit(1);
  }

  console.log(\`\\n🚀 Creating FastAPI project: \${projectName}\\n\`);
  
  const snakeName = projectName.replace(/-/g, '_').toLowerCase();
  const project_name = await ask('Project name (snake_case)', snakeName);
  const author = await ask('Author name', process.env.USER || 'RapidKit User');
  const description = await ask('Description', 'FastAPI service generated with RapidKit');
  
  rl.close();

  // Create project structure
  const dirs = [
    '',
    'src',
    'src/routing',
    'src/modules',
    'tests',
    '.rapidkit'
  ];

  for (const dir of dirs) {
    fs.mkdirSync(path.join(targetPath, dir), { recursive: true });
  }

  // Template files with content
  const files = {
    'src/__init__.py': '"""' + project_name + ' package."""\\n',
    'src/modules/__init__.py': '"""Modules package."""\\n',
    'tests/__init__.py': '"""Tests package."""\\n',
    'src/main.py': \`"""$\{project_name} application entrypoint."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routing import api_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan context manager for startup/shutdown events."""
    yield


app = FastAPI(
    title="$\{project_name}",
    description="$\{description}",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=True)
\`,
    'src/routing/__init__.py': \`"""API routing configuration."""

from fastapi import APIRouter

from .health import router as health_router

api_router = APIRouter()

api_router.include_router(health_router)
\`,
    'src/routing/health.py': \`"""Health check endpoints."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", summary="Health check")
async def heartbeat() -> dict[str, str]:
    """Return basic service heartbeat."""
    return {"status": "ok"}
\`,
    'src/cli.py': \`"""CLI commands for $\{project_name}."""

import subprocess
import sys
from pathlib import Path


def dev():
    """Start development server with hot reload."""
    print("🚀 Starting development server...")
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "src.main:app", "--reload",
        "--host", "0.0.0.0", "--port", "8000"
    ])


def start():
    """Start production server."""
    print("⚡ Starting production server...")
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "src.main:app",
        "--host", "0.0.0.0", "--port", "8000"
    ])


def test():
    """Run tests."""
    print("🧪 Running tests...")
    subprocess.run([sys.executable, "-m", "pytest", "-q"])


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m src.cli <command>")
        print("Commands: dev, start, test")
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "dev":
        dev()
    elif cmd == "start":
        start()
    elif cmd == "test":
        test()
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
\`,
    'pyproject.toml': \`[tool.poetry]
name = "$\{project_name}"
version = "0.1.0"
description = "$\{description}"
authors = ["$\{author}"]
license = "MIT"
readme = "README.md"
package-mode = false

[tool.poetry.dependencies]
python = "^3.10"
fastapi = "^0.128.0"
uvicorn = {extras = ["standard"], version = "^0.40.0"}
pydantic = "^2.12.5"
pydantic-settings = "^2.12.0"

[tool.poetry.group.dev.dependencies]
pytest = "^9.0.2"
pytest-asyncio = "^1.3.0"
pytest-cov = "^7.0.0"
httpx = "^0.28.1"
black = "^25.12.0"
ruff = "^0.14.10"
mypy = "^1.19.1"

[tool.poetry.scripts]
dev = "src.cli:dev"
start = "src.cli:start"
test = "src.cli:test"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.black]
line-length = 100
target-version = ["py311"]
\`,
    'README.md': \`# $\{project_name}

$\{description}

## Quick start

\\\`\\\`\\\`bash
npx rapidkit init       # Install dependencies
npx rapidkit dev        # Start dev server
\\\`\\\`\\\`

## Available commands

\\\`\\\`\\\`bash
npx rapidkit init       # 🔧 Install dependencies
npx rapidkit dev        # 🚀 Start development server with hot reload
npx rapidkit start      # ⚡ Start production server
npx rapidkit test       # 🧪 Run tests
npx rapidkit help       # 📚 Show available commands
\\\`\\\`\\\`

## Project layout

\\\`\\\`\\\`
$\{project_name}/
├── src/
│   ├── main.py           # FastAPI application
│   ├── cli.py            # CLI commands
│   ├── routing/          # API routes
│   └── modules/          # Module system
├── tests/                # Test suite
├── pyproject.toml        # Poetry configuration
└── README.md
\\\`\\\`\\\`
\`,
    '.rapidkit/project.json': JSON.stringify({
      kit_name: "fastapi.standard",
      profile: "fastapi/standard",
      created_at: new Date().toISOString(),
      rapidkit_version: "npm-demo"
    }, null, 2),
    '.rapidkit/cli.py': \`#!/usr/bin/env python3
"""RapidKit CLI wrapper for demo projects."""

import subprocess
import sys
from pathlib import Path


def dev(port=8000, host="0.0.0.0"):
    """Start development server."""
    print("🚀 Starting development server with hot reload...")
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "src.main:app", "--reload",
        "--host", host, "--port", str(port)
    ])


def start(port=8000, host="0.0.0.0"):
    """Start production server."""
    print("⚡ Starting production server...")
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "src.main:app",
        "--host", host, "--port", str(port)
    ])


def init():
    """Install dependencies."""
    print("📦 Installing dependencies...")
    subprocess.run(["poetry", "install"])


def test():
    """Run tests."""
    print("🧪 Running tests...")
    subprocess.run([sys.executable, "-m", "pytest", "-q"])


def help_cmd():
    """Show help."""
    print("📚 Available commands:")
    print("  init   - Install dependencies")
    print("  dev    - Start dev server")
    print("  start  - Start production server")
    print("  test   - Run tests")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"
    cmds = {"dev": dev, "start": start, "init": init, "test": test, "help": help_cmd}
    cmds.get(cmd, help_cmd)()
\`,
    '.rapidkit/rapidkit': '#!/usr/bin/env bash\\n# Local RapidKit launcher for demo projects\\nset -euo pipefail\\nSCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"\\nROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"\\ncd "$ROOT_DIR"\\n\\nif [ -f "pyproject.toml" ]; then\\n  if command -v poetry >/dev/null 2>&1; then\\n    exec poetry run python "$SCRIPT_DIR/cli.py" "$@"\\n  fi\\nfi\\n\\necho "Poetry not found. Install with: pip install poetry"\\nexit 1\\n',
    '.gitignore': \`# Python
__pycache__/
*.py[cod]
*.so
.Python
build/
dist/
*.egg-info/

# Virtual environments
.venv/
venv/

# IDEs
.vscode/
.idea/

# OS
.DS_Store

# Project
.env
.env.local
\`
  };

  for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(targetPath, filePath), content);
  }

  // Make scripts executable
  try {
    fs.chmodSync(path.join(targetPath, '.rapidkit/cli.py'), 0o755);
    fs.chmodSync(path.join(targetPath, '.rapidkit/rapidkit'), 0o755);
  } catch (e) {
    // Ignore on Windows
  }

  console.log(\`
✨ Demo project created successfully!

📂 Project: \${targetPath}

🚀 Get started:
  cd \${projectName}
  npx rapidkit init   # Install dependencies
  npx rapidkit dev    # Start dev server

📚 Available commands:
  npx rapidkit init   # 🔧 Install dependencies
  npx rapidkit dev    # 🚀 Start dev server with hot reload
  npx rapidkit start  # ⚡ Start production server
  npx rapidkit test   # 🧪 Run tests
  npx rapidkit help   # 📚 Show help

💡 For full RapidKit features: pipx install rapidkit
\`);
}

main().catch(console.error);
`;

    await fsPromises.writeFile(
      path.join(projectPath, 'generate-demo.js'),
      generateScriptContent,
      'utf-8'
    );

    // Make the script executable
    try {
      await execa('chmod', ['+x', path.join(projectPath, 'generate-demo.js')]);
    } catch {
      // Ignore if chmod fails (e.g., on Windows)
    }

    // Create README
    const readmeContent = `# RapidKit Demo Workspace

Welcome to your RapidKit demo workspace! This environment lets you generate FastAPI demo projects using bundled RapidKit templates, without needing to install Python RapidKit.

## 🚀 Quick Start

### Generate Your First Demo Project

\`\`\`bash
# Generate a demo project:
node generate-demo.js my-api

# Navigate to the project:
cd my-api

# Install dependencies:
rapidkit init

# Run the development server:
rapidkit dev
\`\`\`

Your API will be available at \`http://localhost:8000\`

## 📦 Generate Multiple Projects

You can create multiple demo projects in this workspace:

\`\`\`bash
node generate-demo.js api-service
node generate-demo.js auth-service
node generate-demo.js data-service
\`\`\`

Each project is independent and has its own dependencies.

## 🎯 What's Included

Each generated demo project contains:

- **FastAPI Application** - Modern async web framework
- **Routing System** - Organized API routes
- **Module System** - Extensible module architecture
- **CLI Commands** - Built-in command system
- **Testing Setup** - pytest configuration
- **Poetry Configuration** - Dependency management

## 📚 Next Steps

1. **Explore the Generated Code** - Check out \`src/main.py\` and \`src/routing/\`
2. **Add Routes** - Create new endpoints in \`src/routing/\`
3. **Install Full RapidKit** - For advanced features: \`pipx install rapidkit\`
4. **Read the Documentation** - Visit [RapidKit Docs](https://getrapidkit.com)

## ⚠️ Demo Mode Limitations

This is a demo workspace with:
- ✅ Pre-built FastAPI templates
- ✅ Project generation without Python RapidKit
- ❌ No RapidKit CLI commands (\`rapidkit create\`, \`rapidkit add module\`)
- ❌ No interactive module system

For full RapidKit features, install the Python package:

\`\`\`bash
pipx install rapidkit
\`\`\`

## 🛠️ Workspace Structure

\`\`\`
${name}/
  ├── generate-demo.js    # Demo project generator
  ├── README.md           # This file
  └── my-api/             # Your generated projects go here
\`\`\`

## 💡 Tips

- Run \`node generate-demo.js --help\` for more options (coming soon)
- Each project can have different configurations
- Demo projects are production-ready FastAPI applications
- You can copy and modify templates as needed

---

**Generated with RapidKit** | [GitHub](https://github.com/getrapidkit/rapidkit-npm)
`;

    await fsPromises.writeFile(path.join(projectPath, 'README.md'), readmeContent, 'utf-8');
    spinner.succeed('Demo workspace setup complete');

    // Git initialization
    if (!skipGit) {
      spinner.start('Initializing git repository');
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await fsExtra.outputFile(
          path.join(projectPath, '.gitignore'),
          '# Dependencies\nnode_modules/\n\n# Generated projects\n*/\n!generate-demo.js\n!README.md\n\n# Python\n__pycache__/\n*.pyc\n.venv/\n.env\n',
          'utf-8'
        );
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit: Demo workspace'], {
          cwd: projectPath,
        });
        spinner.succeed('Git repository initialized');
      } catch (_error) {
        spinner.warn('Could not initialize git repository');
      }
    }

    // Success message
    console.log(chalk.green('\n✨ Demo workspace created successfully!\n'));
    console.log(chalk.cyan('📂 Location:'), chalk.white(projectPath));
    console.log(chalk.cyan('🚀 Get started:\n'));
    console.log(chalk.white(`   cd ${name}`));
    console.log(chalk.white('   node generate-demo.js my-api'));
    console.log(chalk.white('   cd my-api'));
    console.log(chalk.white('   rapidkit init'));
    console.log(chalk.white('   rapidkit dev'));
    console.log();
    console.log(chalk.yellow('💡 Note:'), 'This is a demo workspace. For full RapidKit features:');
    console.log(chalk.cyan('   pipx install rapidkit'));
    console.log();
  } catch (_error) {
    spinner.fail('Failed to create demo workspace');
    throw _error;
  }
}

/**
 * Show what would be created in dry-run mode
 */
async function showDryRun(
  projectPath: string,
  _name: string,
  demoMode: boolean,
  userConfig: UserConfig
): Promise<void> {
  console.log(chalk.cyan('\n🔍 Dry-run mode - showing what would be created:\n'));
  console.log(chalk.white('📂 Project path:'), projectPath);
  console.log(
    chalk.white('📦 Project type:'),
    demoMode ? 'Demo workspace' : 'Full RapidKit environment'
  );

  if (demoMode) {
    console.log(chalk.white('\n📝 Files to create:'));
    console.log(chalk.gray('  - package.json'));
    console.log(chalk.gray('  - generate-demo.js (project generator)'));
    console.log(chalk.gray('  - README.md'));
    console.log(chalk.gray('  - .gitignore'));
    console.log(chalk.white('\n🎯 Capabilities:'));
    console.log(chalk.gray('  - Generate multiple FastAPI demo projects'));
    console.log(chalk.gray('  - No Python RapidKit installation required'));
    console.log(chalk.gray('  - Bundled templates included'));
  } else {
    console.log(chalk.white('\n⚙️  Configuration:'));
    console.log(chalk.gray(`  - Python version: ${userConfig.pythonVersion || '3.10'}`));
    console.log(chalk.gray(`  - Install method: ${userConfig.defaultInstallMethod || 'poetry'}`));
    console.log(chalk.gray(`  - Git initialization: ${userConfig.skipGit ? 'No' : 'Yes'}`));
    console.log(chalk.white('\n📝 Files to create:'));
    console.log(chalk.gray('  - pyproject.toml (Poetry) or .venv/ (venv)'));
    console.log(chalk.gray('  - README.md'));
    console.log(chalk.gray('  - .gitignore'));
    console.log(chalk.white('\n🎯 Next steps after creation:'));
    console.log(chalk.gray('  1. Install RapidKit Python package'));
    console.log(chalk.gray('  2. Create projects with rapidkit CLI'));
    console.log(chalk.gray('  3. Add modules and customize'));
  }

  console.log(chalk.white('\n💡 To proceed with actual creation, run without --dry-run flag\n'));
}
