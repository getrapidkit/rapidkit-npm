import chalk from 'chalk';
import { execa } from 'execa';
import fsExtra from 'fs-extra';
import path from 'path';
import { logger } from './logger.js';
import inquirer from 'inquirer';

interface HealthCheckResult {
  status: 'ok' | 'warn' | 'error';
  message: string;
  details?: string;
  paths?: { location: string; path: string; version?: string }[]; // Multiple installation paths
}

interface ProjectHealth {
  name: string;
  path: string;
  venvActive: boolean;
  depsInstalled: boolean;
  coreInstalled: boolean;
  coreVersion?: string;
  issues: string[];
  fixCommands?: string[];
  hasEnvFile?: boolean;
  modulesHealthy?: boolean;
  missingModules?: string[];
  framework?: 'FastAPI' | 'NestJS' | 'Unknown';
  kit?: string;
  stats?: {
    modules: number;
    files?: number;
    size?: string;
  };
  lastModified?: string;
  hasTests?: boolean;
  hasDocker?: boolean;
  hasCodeQuality?: boolean;
  vulnerabilities?: number;
}

interface HealthScore {
  total: number;
  passed: number;
  warnings: number;
  errors: number;
}

interface WorkspaceHealth {
  workspacePath: string;
  workspaceName: string;
  python: HealthCheckResult;
  poetry: HealthCheckResult;
  pipx: HealthCheckResult;
  rapidkitCore: HealthCheckResult;
  projects: ProjectHealth[];
  healthScore?: HealthScore;
  coreVersion?: string;
  npmVersion?: string;
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
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const foundPaths: { location: string; path: string; version: string }[] = [];

  // Global installation paths
  const globalPaths = [
    { location: 'Global (pipx)', path: path.join(homeDir, '.local', 'bin', 'rapidkit') },
    {
      location: 'Global (pipx)',
      path: path.join(homeDir, 'AppData', 'Roaming', 'Python', 'Scripts', 'rapidkit.exe'),
    },
    { location: 'Global (pyenv)', path: path.join(homeDir, '.pyenv', 'shims', 'rapidkit') },
    { location: 'Global (system)', path: '/usr/local/bin/rapidkit' },
    { location: 'Global (system)', path: '/usr/bin/rapidkit' },
  ];

  // Workspace installation paths
  const workspacePaths = [
    { location: 'Workspace (.venv)', path: path.join(process.cwd(), '.venv', 'bin', 'rapidkit') },
    {
      location: 'Workspace (.venv)',
      path: path.join(process.cwd(), '.venv', 'Scripts', 'rapidkit.exe'),
    },
  ];

  // Check all paths
  for (const { location, path: rapidkitPath } of [...globalPaths, ...workspacePaths]) {
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
            foundPaths.push({ location, path: rapidkitPath, version: versionMatch[1] });
          }
        }
      }
    } catch {
      continue;
    }
  }

  // If found installations, return them
  if (foundPaths.length > 0) {
    // Use first found version for message
    const primaryVersion = foundPaths[0].version;
    return {
      status: 'ok',
      message: `RapidKit Core ${primaryVersion}`,
      paths: foundPaths.map((f) => ({ location: f.location, path: f.path, version: f.version })),
    };
  }

  // Try checking via PATH
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
    // Not in PATH
  }

  // Try Poetry environment
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

  // Try Python module import (last resort)
  const pythonCommands =
    process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python'];
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

async function performCommonChecks(projectPath: string, health: ProjectHealth): Promise<void> {
  // Docker check
  const dockerfilePath = path.join(projectPath, 'Dockerfile');
  health.hasDocker = await fsExtra.pathExists(dockerfilePath);

  // Tests check
  const testsPath = path.join(projectPath, 'tests');
  const testPath = path.join(projectPath, 'test');
  health.hasTests = (await fsExtra.pathExists(testsPath)) || (await fsExtra.pathExists(testPath));

  // Code Quality checks
  if (health.framework === 'NestJS') {
    // ESLint for NestJS
    const eslintPath = path.join(projectPath, '.eslintrc.js');
    const eslintJsonPath = path.join(projectPath, '.eslintrc.json');
    health.hasCodeQuality =
      (await fsExtra.pathExists(eslintPath)) || (await fsExtra.pathExists(eslintJsonPath));
  } else if (health.framework === 'FastAPI') {
    // Ruff for FastAPI
    const ruffPath = path.join(projectPath, 'ruff.toml');
    const pyprojectPath = path.join(projectPath, 'pyproject.toml');

    if (await fsExtra.pathExists(pyprojectPath)) {
      try {
        const content = await fsExtra.readFile(pyprojectPath, 'utf8');
        health.hasCodeQuality =
          content.includes('[tool.ruff]') || (await fsExtra.pathExists(ruffPath));
      } catch {
        health.hasCodeQuality = await fsExtra.pathExists(ruffPath);
      }
    }
  }

  // Security check - try to detect vulnerabilities
  try {
    if (health.framework === 'NestJS') {
      const { stdout } = await execa('npm', ['audit', '--json'], {
        cwd: projectPath,
        reject: false,
      });

      if (stdout) {
        try {
          const audit = JSON.parse(stdout);
          const vulns = audit.metadata?.vulnerabilities;
          if (vulns) {
            health.vulnerabilities =
              (vulns.high || 0) + (vulns.critical || 0) + (vulns.moderate || 0);
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    } else if (health.framework === 'FastAPI') {
      // Check for safety or pip-audit
      const venvPath = path.join(projectPath, '.venv');
      const pythonPath =
        process.platform === 'win32'
          ? path.join(venvPath, 'Scripts', 'python.exe')
          : path.join(venvPath, 'bin', 'python');

      if (await fsExtra.pathExists(pythonPath)) {
        try {
          const { stdout } = await execa(pythonPath, ['-m', 'pip', 'list', '--format=json'], {
            timeout: 5000,
            reject: false,
          });

          if (stdout) {
            const packages = JSON.parse(stdout);
            void packages; // Placeholder for future pip-audit integration
            // Simple heuristic: flag if there are very old core packages
            // In reality, you'd use safety or pip-audit here
            health.vulnerabilities = 0; // Placeholder
          }
        } catch {
          // Ignore if can't check
        }
      }
    }
  } catch {
    // Ignore security check errors
  }
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
    fixCommands: [],
  };

  // Check for .rapidkit directory
  const rapidkitDir = path.join(projectPath, '.rapidkit');
  if (!(await fsExtra.pathExists(rapidkitDir))) {
    health.issues.push('Not a valid RapidKit project (missing .rapidkit directory)');
    return health;
  }

  // Try to read kit info and stats from registry.json
  try {
    const registryPath = path.join(projectPath, 'registry.json');
    if (await fsExtra.pathExists(registryPath)) {
      const registry = await fsExtra.readJson(registryPath);
      if (registry.installed_modules) {
        health.stats = {
          modules: registry.installed_modules.length,
        };
      }
    }
  } catch {
    // Ignore if can't read registry
  }

  // Try to read kit info from .rapidkit/project.json
  try {
    const projectJsonPath = path.join(rapidkitDir, 'project.json');
    if (await fsExtra.pathExists(projectJsonPath)) {
      const projectData = await fsExtra.readJson(projectJsonPath);
      if (projectData.kit) {
        health.kit = projectData.kit;
      }
    }
  } catch {
    // Ignore if can't read kit info
  }

  // Last Modified check
  try {
    const gitPath = path.join(projectPath, '.git');
    if (await fsExtra.pathExists(gitPath)) {
      const { stdout } = await execa('git', ['log', '-1', '--format=%cr'], {
        cwd: projectPath,
        reject: false,
      });
      if (stdout) {
        health.lastModified = stdout.trim();
      }
    } else {
      // Fallback to directory modification time
      const stat = await fsExtra.stat(projectPath);
      const now = Date.now();
      const diff = now - stat.mtime.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      health.lastModified = days === 0 ? 'today' : `${days} day${days > 1 ? 's' : ''} ago`;
    }
  } catch {
    // Ignore if can't determine last modified
  }

  // Detect project type (Python FastAPI or Node.js NestJS)
  const packageJsonPath = path.join(projectPath, 'package.json');
  const pyprojectTomlPath = path.join(projectPath, 'pyproject.toml');

  const isNodeProject = await fsExtra.pathExists(packageJsonPath);
  const isPythonProject = await fsExtra.pathExists(pyprojectTomlPath);

  // Node.js/NestJS project checks
  if (isNodeProject) {
    health.framework = 'NestJS';
    health.venvActive = true; // N/A for Node.js projects

    // Check for node_modules
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    if (await fsExtra.pathExists(nodeModulesPath)) {
      try {
        const modules = await fsExtra.readdir(nodeModulesPath);
        // Check if there are actual packages (more than just .bin, .cache, etc.)
        const realPackages = modules.filter((m) => !m.startsWith('.') && !m.startsWith('_'));
        health.depsInstalled = realPackages.length > 0;
      } catch {
        health.depsInstalled = false;
      }
    }

    if (!health.depsInstalled) {
      health.issues.push('Dependencies not installed (node_modules empty or missing)');
      health.fixCommands?.push(`cd ${projectPath} && rapidkit init`);
    }

    // Node.js projects don't need Python venv
    health.coreInstalled = false; // N/A for Node.js

    // Check for .env file
    const envPath = path.join(projectPath, '.env');
    health.hasEnvFile = await fsExtra.pathExists(envPath);
    if (!health.hasEnvFile) {
      const envExamplePath = path.join(projectPath, '.env.example');
      if (await fsExtra.pathExists(envExamplePath)) {
        health.issues.push('Environment file missing (found .env.example)');
        health.fixCommands?.push(`cd ${projectPath} && cp .env.example .env`);
      }
    }

    // Check for TypeScript modules (src/)
    const srcPath = path.join(projectPath, 'src');
    health.modulesHealthy = true;
    health.missingModules = [];

    if (await fsExtra.pathExists(srcPath)) {
      try {
        const modules = await fsExtra.readdir(srcPath);
        // Basic check - if src exists and has files, consider it healthy
        health.modulesHealthy = modules.length > 0;
      } catch {
        health.modulesHealthy = false;
      }
    }

    // Common checks for both Node.js and Python
    await performCommonChecks(projectPath, health);

    return health;
  }

  // Python/FastAPI project checks
  if (isPythonProject) {
    health.framework = 'FastAPI';

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
        // Check for rapidkit-core in venv (optional - Core is usually global)
        try {
          const { stdout } = await execa(
            pythonPath,
            ['-c', 'import rapidkit_core; print(rapidkit_core.__version__)'],
            { timeout: 2000 }
          );
          health.coreInstalled = true;
          health.coreVersion = stdout.trim();
        } catch {
          // Not an issue - Core is typically installed globally via pipx
          health.coreInstalled = false;
        }

        // Check if dependencies are installed
        // Try to import a common package to verify installation
        try {
          await execa(pythonPath, ['-c', 'import fastapi'], { timeout: 2000 });
          health.depsInstalled = true;
        } catch {
          // Fallback: check if site-packages has content
          try {
            const libPath = path.join(venvPath, 'lib');
            if (await fsExtra.pathExists(libPath)) {
              const pythonDirs = await fsExtra.readdir(libPath);
              const pythonDir = pythonDirs.find((d) => d.startsWith('python'));

              if (pythonDir) {
                const sitePackagesPath = path.join(libPath, pythonDir, 'site-packages');
                if (await fsExtra.pathExists(sitePackagesPath)) {
                  const packages = await fsExtra.readdir(sitePackagesPath);
                  // Check if there are actual packages (more than just pip/setuptools/wheel)
                  const realPackages = packages.filter(
                    (p) =>
                      !p.startsWith('_') &&
                      !p.includes('dist-info') &&
                      !['pip', 'setuptools', 'wheel', 'pkg_resources'].includes(p)
                  );
                  health.depsInstalled = realPackages.length > 0;
                }
              }
            }

            if (!health.depsInstalled) {
              health.issues.push('Dependencies not installed');
              health.fixCommands?.push(`cd ${projectPath} && rapidkit init`);
            }
          } catch {
            health.issues.push('Could not verify dependency installation');
          }
        }
      } else {
        health.issues.push('Virtual environment exists but Python executable not found');
      }
    } else {
      health.issues.push('Virtual environment not created');
      health.fixCommands?.push(`cd ${projectPath} && rapidkit init`);
    }

    // Check for .env file
    const envPath = path.join(projectPath, '.env');
    health.hasEnvFile = await fsExtra.pathExists(envPath);
    if (!health.hasEnvFile) {
      const envExamplePath = path.join(projectPath, '.env.example');
      if (await fsExtra.pathExists(envExamplePath)) {
        health.issues.push('Environment file missing (found .env.example)');
        health.fixCommands?.push(`cd ${projectPath} && cp .env.example .env`);
      }
    }

    // Check for critical modules (src/__init__.py or modules/)
    const srcPath = path.join(projectPath, 'src');
    const modulesPath = path.join(projectPath, 'modules');

    health.modulesHealthy = true;
    health.missingModules = [];

    if (await fsExtra.pathExists(srcPath)) {
      const srcInit = path.join(srcPath, '__init__.py');
      if (!(await fsExtra.pathExists(srcInit))) {
        health.modulesHealthy = false;
        health.missingModules.push('src/__init__.py');
      }
    }

    if (await fsExtra.pathExists(modulesPath)) {
      try {
        const modules = await listDirectories(modulesPath);
        for (const module of modules) {
          const moduleInit = path.join(modulesPath, module, '__init__.py');
          if (!(await fsExtra.pathExists(moduleInit))) {
            health.modulesHealthy = false;
            health.missingModules.push(`modules/${module}/__init__.py`);
          }
        }
      } catch {
        // Ignore directory read errors
      }
    }

    if (!health.modulesHealthy && health.missingModules.length > 0) {
      health.issues.push(`Missing module init files: ${health.missingModules.join(', ')}`);
    }

    // Common checks for both Node.js and Python
    await performCommonChecks(projectPath, health);

    return health;
  }

  // If neither package.json nor pyproject.toml, return basic health
  health.issues.push('Unknown project type (no package.json or pyproject.toml)');

  await performCommonChecks(projectPath, health);
  return health;
}

async function listDirectories(basePath: string): Promise<string[]> {
  try {
    const entries = await fsExtra.readdir(basePath, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    try {
      const entries = await fsExtra.readdir(basePath);
      const dirs: string[] = [];
      for (const name of entries) {
        try {
          const stat = await fsExtra.stat(path.join(basePath, name));
          if (stat.isDirectory()) {
            dirs.push(name);
          }
        } catch {
          continue;
        }
      }
      return dirs;
    } catch {
      return [];
    }
  }
}

async function findRapidkitProjectsDeep(
  workspacePath: string,
  maxDepth: number,
  ignoredDirs: Set<string>
): Promise<string[]> {
  const results = new Set<string>();
  const queue: Array<{ dir: string; depth: number }> = [{ dir: workspacePath, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    try {
      const entries = await fsExtra.readdir(current.dir);
      for (const name of entries) {
        if (ignoredDirs.has(name)) continue;

        const fullPath = path.join(current.dir, name);
        let stat;
        try {
          stat = await fsExtra.stat(fullPath);
        } catch {
          continue;
        }

        if (!stat.isDirectory()) continue;

        const rapidkitDir = path.join(fullPath, '.rapidkit');
        if (await fsExtra.pathExists(rapidkitDir)) {
          results.add(fullPath);
          continue;
        }

        if (current.depth < maxDepth) {
          queue.push({ dir: fullPath, depth: current.depth + 1 });
        }
      }
    } catch {
      continue;
    }
  }

  return Array.from(results);
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

function calculateHealthScore(
  systemChecks: HealthCheckResult[],
  projects: ProjectHealth[]
): HealthScore {
  let passed = 0;
  let warnings = 0;
  let errors = 0;

  // Count system checks
  systemChecks.forEach((check) => {
    if (check.status === 'ok') passed++;
    else if (check.status === 'warn') warnings++;
    else if (check.status === 'error') errors++;
  });

  // Count project issues
  projects.forEach((project) => {
    if (project.issues.length === 0 && project.venvActive && project.depsInstalled) {
      passed++;
    } else if (project.issues.length > 0) {
      warnings++;
    }
  });

  const total = passed + warnings + errors;
  return { total, passed, warnings, errors };
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
    rapidkitCore: await checkRapidKitCore(), // Will check workspace venv first via updated logic
    projects: [],
  };

  // Find all projects in workspace (shallow recursive scan)
  try {
    const ignoredDirs = new Set([
      '.git',
      '.venv',
      'node_modules',
      '.rapidkit',
      'dist',
      'build',
      'coverage',
      '__pycache__',
    ]);
    const projectPaths = new Set<string>();

    const workspaceRapidkit = path.join(workspacePath, '.rapidkit');
    if (await fsExtra.pathExists(workspaceRapidkit)) {
      projectPaths.add(workspacePath);
    }

    const scanDirs = async (basePath: string, depth: number) => {
      if (depth < 0) return;
      const dirNames = await listDirectories(basePath);
      for (const dirName of dirNames) {
        if (ignoredDirs.has(dirName)) continue;
        const dirPath = path.join(basePath, dirName);
        const rapidkitDir = path.join(dirPath, '.rapidkit');

        if (await fsExtra.pathExists(rapidkitDir)) {
          projectPaths.add(dirPath);
          continue;
        }

        if (depth > 0) {
          await scanDirs(dirPath, depth - 1);
        }
      }
    };

    await scanDirs(workspacePath, 1);
    logger.debug(`Workspace scan (shallow) found ${projectPaths.size} project(s)`);

    if (projectPaths.size === 0) {
      const fallbackProjects = await findRapidkitProjectsDeep(workspacePath, 3, ignoredDirs);
      fallbackProjects.forEach((projectPath) => projectPaths.add(projectPath));
      logger.debug(`Workspace scan (deep fallback) found ${fallbackProjects.length} project(s)`);
    }

    if (projectPaths.size > 0) {
      logger.debug(`Workspace projects detected: ${Array.from(projectPaths).join(', ')}`);
    }

    for (const projectPath of projectPaths) {
      const projectHealth = await checkProject(projectPath);
      health.projects.push(projectHealth);
    }
  } catch (err) {
    logger.debug(`Failed to scan workspace projects: ${err}`);
  }

  // Calculate health score
  const systemChecks = [health.python, health.poetry, health.pipx, health.rapidkitCore];
  health.healthScore = calculateHealthScore(systemChecks, health.projects);

  // Extract version info
  if (health.rapidkitCore.status === 'ok') {
    const versionMatch = health.rapidkitCore.message.match(/([\d.]+(?:rc\d+)?(?:a\d+)?(?:b\d+)?)/);
    if (versionMatch) {
      health.coreVersion = versionMatch[1];
    }
  }

  return health;
}

function renderHealthCheck(check: HealthCheckResult, label: string): void {
  const icon = check.status === 'ok' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
  const color =
    check.status === 'ok' ? chalk.green : check.status === 'warn' ? chalk.yellow : chalk.red;

  console.log(`${icon} ${chalk.bold(label)}: ${color(check.message)}`);

  // Show multiple paths if available
  if (check.paths && check.paths.length > 0) {
    check.paths.forEach((p) => {
      const versionSuffix = p.version ? chalk.cyan(` -> ${p.version}`) : '';
      console.log(
        `   ${chalk.cyan('•')} ${chalk.gray(p.location)}: ${chalk.dim(p.path)}${versionSuffix}`
      );
    });
  } else if (check.details) {
    console.log(`   ${chalk.gray(check.details)}`);
  }
}

function renderProjectHealth(project: ProjectHealth): void {
  const hasIssues = project.issues.length > 0;
  const icon = hasIssues ? '⚠️' : '✅';
  const nameColor = hasIssues ? chalk.yellow : chalk.green;

  console.log(`\n${icon} ${chalk.bold('Project')}: ${nameColor(project.name)}`);

  // Show framework
  if (project.framework) {
    const frameworkIcon =
      project.framework === 'FastAPI' ? '🐍' : project.framework === 'NestJS' ? '🦅' : '📦';
    console.log(
      `   ${frameworkIcon} Framework: ${chalk.cyan(project.framework)}${project.kit ? chalk.gray(` (${project.kit})`) : ''}`
    );
  }

  console.log(`   ${chalk.gray(`Path: ${project.path}`)}`);

  // Detect project type based on what was checked
  const isNodeProject = project.venvActive && !project.coreInstalled;
  const isPythonProject = !isNodeProject;

  if (isPythonProject) {
    // Python project display
    if (project.venvActive) {
      console.log(`   ✅ Virtual environment: ${chalk.green('Active')}`);
    } else {
      console.log(`   ❌ Virtual environment: ${chalk.red('Not found')}`);
    }

    if (project.coreInstalled) {
      console.log(
        `   ${chalk.dim('ℹ')}  RapidKit Core: ${chalk.gray(project.coreVersion || 'In venv')} ${chalk.dim('(optional)')}`
      );
    } else {
      console.log(
        `   ${chalk.dim('ℹ')}  RapidKit Core: ${chalk.gray('Using global installation')} ${chalk.dim('(recommended)')}`
      );
    }
  }

  // Dependencies (both Python and Node.js)
  if (project.depsInstalled) {
    console.log(`   ✅ Dependencies: ${chalk.green('Installed')}`);
  } else {
    console.log(`   ⚠️  Dependencies: ${chalk.yellow('Not installed')}`);
  }

  // Environment file check
  if (project.hasEnvFile !== undefined) {
    if (project.hasEnvFile) {
      console.log(`   ✅ Environment: ${chalk.green('.env configured')}`);
    } else {
      console.log(`   ⚠️  Environment: ${chalk.yellow('.env missing')}`);
    }
  }

  // Module health check
  if (project.modulesHealthy !== undefined) {
    if (project.modulesHealthy) {
      console.log(`   ✅ Modules: ${chalk.green('Healthy')}`);
    } else if (project.missingModules && project.missingModules.length > 0) {
      console.log(
        `   ⚠️  Modules: ${chalk.yellow(`Missing ${project.missingModules.length} init file(s)`)}`
      );
    }
  }

  // Project Stats
  if (project.stats) {
    const statsLine = [];
    if (project.stats.modules !== undefined) {
      statsLine.push(`${project.stats.modules} module${project.stats.modules !== 1 ? 's' : ''}`);
    }
    if (statsLine.length > 0) {
      console.log(`   📊 Stats: ${chalk.cyan(statsLine.join(' • '))}`);
    }
  }

  // Last Modified
  if (project.lastModified) {
    console.log(`   🕒 Last Modified: ${chalk.gray(project.lastModified)}`);
  }

  // Additional checks
  const additionalChecks = [];
  if (project.hasTests !== undefined) {
    additionalChecks.push(project.hasTests ? '✅ Tests' : chalk.dim('⊘ No tests'));
  }
  if (project.hasDocker !== undefined) {
    additionalChecks.push(project.hasDocker ? '✅ Docker' : chalk.dim('⊘ No Docker'));
  }
  if (project.hasCodeQuality !== undefined) {
    const qualityTool = project.framework === 'NestJS' ? 'ESLint' : 'Ruff';
    additionalChecks.push(
      project.hasCodeQuality ? `✅ ${qualityTool}` : chalk.dim(`⊘ No ${qualityTool}`)
    );
  }

  if (additionalChecks.length > 0) {
    console.log(`   ${additionalChecks.join(' • ')}`);
  }

  // Security vulnerabilities
  if (project.vulnerabilities !== undefined && project.vulnerabilities > 0) {
    console.log(
      `   ⚠️  Security: ${chalk.yellow(`${project.vulnerabilities} vulnerability(ies) found`)}`
    );
  }

  if (project.issues.length > 0) {
    console.log(`   ${chalk.bold('Issues:')}`);
    project.issues.forEach((issue) => {
      console.log(`     • ${chalk.yellow(issue)}`);
    });

    // Show fix commands
    if (project.fixCommands && project.fixCommands.length > 0) {
      console.log(`\n   ${chalk.bold.cyan('🔧 Quick Fix:')}`);
      project.fixCommands.forEach((cmd) => {
        console.log(`   ${chalk.cyan('$')} ${chalk.white(cmd)}`);
      });
    }
  }
}

async function executeFixCommands(
  projects: ProjectHealth[],
  autoFix: boolean = false
): Promise<void> {
  const fixableProjects = projects.filter((p) => p.fixCommands && p.fixCommands.length > 0);

  if (fixableProjects.length === 0) {
    console.log(chalk.green('\n✅ No fixes needed - all projects are healthy!'));
    return;
  }

  console.log(chalk.bold.cyan('\n🔧 Available Fixes:\n'));

  for (const project of fixableProjects) {
    console.log(chalk.bold(`Project: ${chalk.yellow(project.name)}`));
    project.fixCommands!.forEach((cmd, idx) => {
      console.log(`  ${idx + 1}. ${chalk.cyan(cmd)}`);
    });
    console.log();
  }

  if (!autoFix) {
    console.log(chalk.gray('💡 Run with --fix flag to apply fixes automatically'));
    return;
  }

  // Confirm before proceeding
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Apply ${fixableProjects.reduce((sum, p) => sum + p.fixCommands!.length, 0)} fix(es)?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\n⚠️  Fixes cancelled by user'));
    return;
  }

  console.log(chalk.bold.cyan('\n🚀 Applying fixes...\n'));

  for (const project of fixableProjects) {
    console.log(chalk.bold(`Fixing ${chalk.cyan(project.name)}...`));

    for (const cmd of project.fixCommands!) {
      try {
        console.log(chalk.gray(`  $ ${cmd}`));

        // Execute the full command through shell for proper command resolution
        await execa(cmd, {
          shell: true,
          stdio: 'inherit',
        });

        console.log(chalk.green(`  ✅ Success\n`));
      } catch (error) {
        console.log(
          chalk.red(`  ❌ Failed: ${error instanceof Error ? error.message : String(error)}\n`)
        );
      }
    }
  }

  console.log(chalk.bold.green('\n✅ Fix process completed!'));
}

export async function runDoctor(
  options: { workspace?: boolean; json?: boolean; fix?: boolean } = {}
): Promise<void> {
  if (!options.json) {
    console.log(chalk.bold.cyan('\n🩺 RapidKit Health Check\n'));
  }

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

    if (!options.json) {
      console.log(chalk.bold(`Workspace: ${chalk.cyan(path.basename(workspacePath))}`));
      console.log(chalk.gray(`Path: ${workspacePath}`));
    }

    const health = await getWorkspaceHealth(workspacePath);

    // JSON output mode
    if (options.json) {
      const output = {
        workspace: {
          name: path.basename(workspacePath),
          path: workspacePath,
        },
        healthScore: health.healthScore,
        system: {
          python: health.python,
          poetry: health.poetry,
          pipx: health.pipx,
          rapidkitCore: health.rapidkitCore,
          versions: {
            core: health.coreVersion,
            npm: health.npmVersion,
          },
        },
        projects: health.projects.map((p) => ({
          name: p.name,
          path: p.path,
          venvActive: p.venvActive,
          depsInstalled: p.depsInstalled,
          coreInstalled: p.coreInstalled,
          coreVersion: p.coreVersion,
          issues: p.issues,
          fixCommands: p.fixCommands,
        })),
        summary: {
          totalProjects: health.projects.length,
          totalIssues: health.projects.reduce((sum, p) => sum + p.issues.length, 0),
          hasSystemErrors: [health.python, health.rapidkitCore].some((c) => c.status === 'error'),
        },
      };

      console.log(JSON.stringify(output, null, 2));
      return;
    }

    // Render health score
    if (health.healthScore) {
      const score = health.healthScore;
      const percentage = Math.round((score.passed / score.total) * 100);
      const scoreColor =
        percentage >= 80 ? chalk.green : percentage >= 50 ? chalk.yellow : chalk.red;
      const bar =
        '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));

      console.log(chalk.bold('\n📊 Health Score:'));
      console.log(`   ${scoreColor(`${percentage}%`)} ${chalk.gray(bar)}`);
      console.log(
        `   ${chalk.green(`✅ ${score.passed} passed`)} ${chalk.gray('|')} ${chalk.yellow(`⚠️ ${score.warnings} warnings`)} ${chalk.gray('|')} ${chalk.red(`❌ ${score.errors} errors`)}`
      );
    }

    console.log(chalk.bold('\n\nSystem Tools:\n'));
    renderHealthCheck(health.python, 'Python');
    renderHealthCheck(health.poetry, 'Poetry');
    renderHealthCheck(health.pipx, 'pipx');
    renderHealthCheck(health.rapidkitCore, 'RapidKit Core');

    // Version compatibility warning
    if (health.coreVersion && health.npmVersion) {
      const coreMinor = health.coreVersion.split('.')[1];
      const npmMinor = health.npmVersion.split('.')[1];

      if (coreMinor !== npmMinor) {
        console.log(
          chalk.yellow(
            `\n⚠️  Version mismatch: Core ${health.coreVersion} / CLI ${health.npmVersion}`
          )
        );
        console.log(chalk.gray('   Consider updating to matching versions for best compatibility'));
      }
    }

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

      // Execute fixes if requested
      if (options.fix) {
        await executeFixCommands(health.projects, true);
      } else if (totalIssues > 0) {
        await executeFixCommands(health.projects, false);
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
