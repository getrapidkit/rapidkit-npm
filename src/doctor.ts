import chalk from 'chalk';
import { execa } from 'execa';
import * as fsExtra from 'fs-extra';
import path from 'path';
import { logger } from './logger.js';

interface HealthCheckResult {
  status: 'ok' | 'warn' | 'error';
  message: string;
  details?: string;
}

interface ProjectHealth {
  name: string;
  path: string;
  venvActive: boolean;
  depsInstalled: boolean;
  coreInstalled: boolean;
  coreVersion?: string;
  issues: string[];
}

interface WorkspaceHealth {
  workspacePath: string;
  workspaceName: string;
  python: HealthCheckResult;
  poetry: HealthCheckResult;
  pipx: HealthCheckResult;
  rapidkitCore: HealthCheckResult;
  projects: ProjectHealth[];
}

async function checkPython(): Promise<HealthCheckResult> {
  const pythonCommands =
    process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];

  for (const cmd of pythonCommands) {
    try {
      const { stdout } = await execa(cmd, ['--version'], { timeout: 3000 });
      const match = stdout.match(/Python (\d+\.\d+\.\d+)/);
      if (match) {
        const version = match[1];
        const [major, minor] = version.split('.').map(Number);

        if (major < 3 || (major === 3 && minor < 10)) {
          return {
            status: 'warn',
            message: `Python ${version} (requires 3.10+)`,
            details: `${cmd} found but version is below minimum requirement`,
          };
        }

        return {
          status: 'ok',
          message: `Python ${version}`,
          details: `Using ${cmd}`,
        };
      }
    } catch {
      continue;
    }
  }

  return {
    status: 'error',
    message: 'Python not found',
    details: "Install Python 3.10+ and ensure it's in PATH",
  };
}

async function checkPoetry(): Promise<HealthCheckResult> {
  try {
    const { stdout } = await execa('poetry', ['--version'], { timeout: 3000 });
    const match = stdout.match(/Poetry .*version ([\d.]+)/);
    if (match) {
      return {
        status: 'ok',
        message: `Poetry ${match[1]}`,
        details: 'Available for dependency management',
      };
    }
    return { status: 'warn', message: 'Poetry version unknown' };
  } catch {
    return {
      status: 'warn',
      message: 'Poetry not installed',
      details: 'Optional: Install for better dependency management',
    };
  }
}

async function checkPipx(): Promise<HealthCheckResult> {
  try {
    const { stdout } = await execa('pipx', ['--version'], { timeout: 3000 });
    const version = stdout.trim();
    return {
      status: 'ok',
      message: `pipx ${version}`,
      details: 'Available for global tool installation',
    };
  } catch {
    return {
      status: 'warn',
      message: 'pipx not installed',
      details: 'Optional: Install for isolated Python tools',
    };
  }
}

async function checkRapidKitCore(): Promise<HealthCheckResult> {
  const pythonCommands =
    process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';

  // Common paths where rapidkit might be installed
  const commonPaths = [
    path.join(homeDir, '.local', 'bin', 'rapidkit'), // pipx default (Linux/Mac)
    path.join(homeDir, 'AppData', 'Roaming', 'Python', 'Scripts', 'rapidkit.exe'), // Windows
    path.join(homeDir, '.pyenv', 'shims', 'rapidkit'), // pyenv
    '/usr/local/bin/rapidkit', // system install
    '/usr/bin/rapidkit', // system install
  ];

  // Try direct rapidkit command first (works if in PATH)
  try {
    const { stdout, exitCode } = await execa('rapidkit', ['--version'], {
      timeout: 3000,
      reject: false,
    });

    if (exitCode === 0 && (stdout.includes('RapidKit Version') || stdout.includes('RapidKit'))) {
      const versionMatch = stdout.match(/v?([\d.]+(?:rc\d+)?(?:a\d+)?(?:b\d+)?)/);
      if (versionMatch) {
        return {
          status: 'ok',
          message: `RapidKit Core ${versionMatch[1]}`,
          details: 'Available via PATH',
        };
      }
    }
  } catch {
    // Not in PATH, try common locations
  }

  // Try common installation paths directly
  for (const rapidkitPath of commonPaths) {
    try {
      if (await fsExtra.pathExists(rapidkitPath)) {
        const { stdout, exitCode } = await execa(rapidkitPath, ['--version'], {
          timeout: 3000,
          reject: false,
        });

        if (
          exitCode === 0 &&
          (stdout.includes('RapidKit Version') || stdout.includes('RapidKit'))
        ) {
          const versionMatch = stdout.match(/v?([\d.]+(?:rc\d+)?(?:a\d+)?(?:b\d+)?)/);
          if (versionMatch) {
            return {
              status: 'ok',
              message: `RapidKit Core ${versionMatch[1]}`,
              details: `Installed at ${rapidkitPath}`,
            };
          }
        }
      }
    } catch {
      continue;
    }
  }

  // Try checking workspace .venv (if we're in a workspace)
  try {
    const venvRapidkit = path.join(process.cwd(), '.venv', 'bin', 'rapidkit');
    if (await fsExtra.pathExists(venvRapidkit)) {
      const { stdout, exitCode } = await execa(venvRapidkit, ['--version'], {
        timeout: 3000,
        reject: false,
      });

      if (exitCode === 0 && (stdout.includes('RapidKit Version') || stdout.includes('RapidKit'))) {
        const versionMatch = stdout.match(/v?([\d.]+(?:rc\d+)?(?:a\d+)?(?:b\d+)?)/);
        if (versionMatch) {
          return {
            status: 'ok',
            message: `RapidKit Core ${versionMatch[1]}`,
            details: 'Installed in workspace virtualenv',
          };
        }
      }
    }
  } catch {
    // Not in workspace venv
  }

  // Try Poetry environment (if in a workspace)
  try {
    const { stdout, exitCode } = await execa('poetry', ['run', 'rapidkit', '--version'], {
      timeout: 3000,
      reject: false,
    });

    if (exitCode === 0 && (stdout.includes('RapidKit Version') || stdout.includes('RapidKit'))) {
      const versionMatch = stdout.match(/v?([\d.]+(?:rc\d+)?(?:a\d+)?(?:b\d+)?)/);
      if (versionMatch) {
        return {
          status: 'ok',
          message: `RapidKit Core ${versionMatch[1]}`,
          details: 'Available via Poetry',
        };
      }
    }
  } catch {
    // Poetry not available
  }

  // Try Python module import (last resort - checks if rapidkit_core is importable)
  for (const cmd of pythonCommands) {
    try {
      const { stdout, exitCode } = await execa(
        cmd,
        ['-c', 'import rapidkit_core; print(rapidkit_core.__version__)'],
        { timeout: 3000, reject: false }
      );

      if (
        exitCode === 0 &&
        stdout &&
        !stdout.includes('Traceback') &&
        !stdout.includes('ModuleNotFoundError')
      ) {
        const version = stdout.trim();
        if (version) {
          return {
            status: 'ok',
            message: `RapidKit Core ${version}`,
            details: `Available in ${cmd} environment`,
          };
        }
      }
    } catch {
      continue;
    }
  }

  return {
    status: 'error',
    message: 'RapidKit Core not installed',
    details: 'Install with: pipx install rapidkit-core',
  };
}

async function checkProject(projectPath: string): Promise<ProjectHealth> {
  const projectName = path.basename(projectPath);
  const health: ProjectHealth = {
    name: projectName,
    path: projectPath,
    venvActive: false,
    depsInstalled: false,
    coreInstalled: false,
    issues: [],
  };

  // Check for .rapidkit directory
  const rapidkitDir = path.join(projectPath, '.rapidkit');
  if (!(await fsExtra.pathExists(rapidkitDir))) {
    health.issues.push('Not a valid RapidKit project (missing .rapidkit directory)');
    return health;
  }

  // Check for virtual environment
  const venvPath = path.join(projectPath, '.venv');
  if (await fsExtra.pathExists(venvPath)) {
    health.venvActive = true;

    // Check if dependencies are installed
    const pythonPath =
      process.platform === 'win32'
        ? path.join(venvPath, 'Scripts', 'python.exe')
        : path.join(venvPath, 'bin', 'python');

    if (await fsExtra.pathExists(pythonPath)) {
      // Check for rapidkit-core in venv
      try {
        const { stdout } = await execa(
          pythonPath,
          ['-c', 'import rapidkit_core; print(rapidkit_core.__version__)'],
          { timeout: 2000 }
        );
        health.coreInstalled = true;
        health.coreVersion = stdout.trim();
      } catch {
        health.issues.push('RapidKit Core not installed in virtual environment');
      }

      // Check if dependencies are installed (check for site-packages)
      const sitePackages =
        process.platform === 'win32'
          ? path.join(venvPath, 'Lib', 'site-packages')
          : path.join(venvPath, 'lib', 'python*', 'site-packages');

      try {
        const exists = await fsExtra.pathExists(path.dirname(sitePackages));
        health.depsInstalled = exists;
        if (!exists) {
          health.issues.push('Dependencies not installed (run: rapidkit init)');
        }
      } catch {
        health.issues.push('Could not verify dependency installation');
      }
    } else {
      health.issues.push('Virtual environment exists but Python executable not found');
    }
  } else {
    health.issues.push('Virtual environment not created (run: rapidkit init)');
  }

  return health;
}

async function findWorkspace(startPath: string): Promise<string | null> {
  let currentPath = startPath;
  const root = path.parse(currentPath).root;

  while (currentPath !== root) {
    // Check for workspace marker files (multiple formats)
    const markerFiles = [
      path.join(currentPath, '.rapidkit-workspace'), // npm CLI workspace marker
      path.join(currentPath, '.rapidkit', 'workspace-marker.json'), // alternative format
      path.join(currentPath, '.rapidkit', 'config.json'), // VS Code extension format
    ];

    for (const markerFile of markerFiles) {
      if (await fsExtra.pathExists(markerFile)) {
        return currentPath;
      }
    }

    currentPath = path.dirname(currentPath);
  }

  return null;
}

async function getWorkspaceHealth(workspacePath: string): Promise<WorkspaceHealth> {
  let workspaceName = path.basename(workspacePath);

  // Try to read workspace name from marker file
  try {
    const markerPath = path.join(workspacePath, '.rapidkit-workspace');
    if (await fsExtra.pathExists(markerPath)) {
      const marker = await fsExtra.readJSON(markerPath);
      workspaceName = marker.name || workspaceName;
    }
  } catch {
    // Try alternative format
    try {
      const configPath = path.join(workspacePath, '.rapidkit', 'config.json');
      const config = await fsExtra.readJSON(configPath);
      workspaceName = config.workspace_name || workspaceName;
    } catch {
      // Use directory name as fallback
    }
  }

  const health: WorkspaceHealth = {
    workspacePath,
    workspaceName,
    python: await checkPython(),
    poetry: await checkPoetry(),
    pipx: await checkPipx(),
    rapidkitCore: await checkRapidKitCore(),
    projects: [],
  };

  // Find all projects in workspace
  try {
    const entries = await fsExtra.readdir(workspacePath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const projectPath = path.join(workspacePath, entry.name);
        const rapidkitDir = path.join(projectPath, '.rapidkit');

        if (await fsExtra.pathExists(rapidkitDir)) {
          const projectHealth = await checkProject(projectPath);
          health.projects.push(projectHealth);
        }
      }
    }
  } catch (err) {
    logger.debug(`Failed to scan workspace projects: ${err}`);
  }

  return health;
}

function renderHealthCheck(check: HealthCheckResult, label: string): void {
  const icon = check.status === 'ok' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
  const color =
    check.status === 'ok' ? chalk.green : check.status === 'warn' ? chalk.yellow : chalk.red;

  console.log(`${icon} ${chalk.bold(label)}: ${color(check.message)}`);
  if (check.details) {
    console.log(`   ${chalk.gray(check.details)}`);
  }
}

function renderProjectHealth(project: ProjectHealth): void {
  const hasIssues = project.issues.length > 0;
  const icon = hasIssues ? '⚠️' : '✅';
  const nameColor = hasIssues ? chalk.yellow : chalk.green;

  console.log(`\n${icon} ${chalk.bold('Project')}: ${nameColor(project.name)}`);
  console.log(`   ${chalk.gray(`Path: ${project.path}`)}`);

  if (project.venvActive) {
    console.log(`   ✅ Virtual environment: ${chalk.green('Active')}`);
  } else {
    console.log(`   ❌ Virtual environment: ${chalk.red('Not found')}`);
  }

  if (project.coreInstalled) {
    console.log(`   ✅ RapidKit Core: ${chalk.green(project.coreVersion || 'Installed')}`);
  } else {
    console.log(`   ❌ RapidKit Core: ${chalk.red('Not installed')}`);
  }

  if (project.depsInstalled) {
    console.log(`   ✅ Dependencies: ${chalk.green('Installed')}`);
  } else {
    console.log(`   ⚠️  Dependencies: ${chalk.yellow('Not verified')}`);
  }

  if (project.issues.length > 0) {
    console.log(`   ${chalk.bold('Issues:')}`);
    project.issues.forEach((issue) => {
      console.log(`     • ${chalk.yellow(issue)}`);
    });
  }
}

export async function runDoctor(options: { workspace?: boolean } = {}): Promise<void> {
  console.log(chalk.bold.cyan('\n🩺 RapidKit Health Check\n'));

  if (options.workspace) {
    // Workspace mode: check entire workspace
    const workspacePath = await findWorkspace(process.cwd());

    if (!workspacePath) {
      logger.error('No RapidKit workspace found in current directory or parents');
      logger.info(
        'Run this command from within a workspace, or use "rapidkit doctor" for system check'
      );
      process.exit(1);
    }

    console.log(chalk.bold(`Workspace: ${chalk.cyan(path.basename(workspacePath))}`));
    console.log(chalk.gray(`Path: ${workspacePath}\n`));

    const health = await getWorkspaceHealth(workspacePath);

    console.log(chalk.bold('System Tools:\n'));
    renderHealthCheck(health.python, 'Python');
    renderHealthCheck(health.poetry, 'Poetry');
    renderHealthCheck(health.pipx, 'pipx');
    renderHealthCheck(health.rapidkitCore, 'RapidKit Core');

    if (health.projects.length > 0) {
      console.log(chalk.bold(`\n📦 Projects (${health.projects.length}):`));
      health.projects.forEach((project) => renderProjectHealth(project));
    } else {
      console.log(chalk.bold('\n📦 Projects:'));
      console.log(chalk.gray('   No RapidKit projects found in workspace'));
    }

    // Summary
    const totalIssues = health.projects.reduce((sum, p) => sum + p.issues.length, 0);
    const hasSystemIssues = [health.python, health.rapidkitCore].some((c) => c.status === 'error');

    if (hasSystemIssues || totalIssues > 0) {
      console.log(chalk.bold.yellow(`\n⚠️  Found ${totalIssues} project issue(s)`));
      if (hasSystemIssues) {
        console.log(chalk.bold.red('❌ System requirements not met'));
      }
    } else {
      console.log(chalk.bold.green('\n✅ All checks passed! Workspace is healthy.'));
    }
  } else {
    // System mode: check system tools only
    console.log(chalk.bold('System Tools:\n'));

    const python = await checkPython();
    const poetry = await checkPoetry();
    const pipx = await checkPipx();
    const core = await checkRapidKitCore();

    renderHealthCheck(python, 'Python');
    renderHealthCheck(poetry, 'Poetry');
    renderHealthCheck(pipx, 'pipx');
    renderHealthCheck(core, 'RapidKit Core');

    const hasErrors = [python, core].some((c) => c.status === 'error');

    if (hasErrors) {
      console.log(chalk.bold.red('\n❌ Some required tools are missing'));
      console.log(
        chalk.gray(
          '\nTip: Run "rapidkit doctor --workspace" from within a workspace for detailed project checks'
        )
      );
    } else {
      console.log(chalk.bold.green('\n✅ All required tools are installed!'));
      console.log(
        chalk.gray(
          '\nTip: Run "rapidkit doctor --workspace" from within a workspace for detailed project checks'
        )
      );
    }
  }

  console.log('');
}
