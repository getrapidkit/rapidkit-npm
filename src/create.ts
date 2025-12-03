import { promises as fsPromises } from 'fs';
import * as fsExtra from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { execa } from 'execa';
import { logger } from './logger.js';
import { UserConfig, getTestRapidKitPath } from './config.js';
import {
  DirectoryExistsError,
  PythonNotFoundError,
  PoetryNotFoundError,
  PipxNotFoundError,
  InstallationError,
  RapidKitNotAvailableError,
} from './errors.js';

interface CreateProjectOptions {
  skipGit?: boolean;
  testMode?: boolean;
  demoMode?: boolean;
  dryRun?: boolean;
  userConfig?: UserConfig;
}

export async function createProject(
  projectName: string | undefined,
  options: CreateProjectOptions
) {
  const {
    skipGit = false,
    testMode = false,
    demoMode = false,
    dryRun = false,
    userConfig = {},
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

  // Step 1: Choose Python version and install method
  const pythonAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'pythonVersion',
      message: 'Select Python version for RapidKit:',
      choices: ['3.10', '3.11', '3.12'],
      default: userConfig.pythonVersion || '3.11',
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
      default: userConfig.defaultInstallMethod || 'poetry',
    },
  ]);

  logger.step(1, 3, 'Setting up RapidKit environment');
  const spinner = ora('Creating directory').start();

  try {
    // Create directory
    await fsExtra.ensureDir(projectPath);
    spinner.succeed('Directory created');

    // Install RapidKit based on method
    if (pythonAnswers.installMethod === 'poetry') {
      await installWithPoetry(
        projectPath,
        pythonAnswers.pythonVersion,
        spinner,
        testMode,
        userConfig
      );
    } else if (pythonAnswers.installMethod === 'venv') {
      await installWithVenv(
        projectPath,
        pythonAnswers.pythonVersion,
        spinner,
        testMode,
        userConfig
      );
    } else {
      await installWithPipx(projectPath, spinner, testMode, userConfig);
    }

    // Create README with instructions
    await createReadme(projectPath, pythonAnswers.installMethod);

    spinner.succeed('RapidKit environment ready!');

    // Git initialization
    if (!options.skipGit) {
      spinner.start('Initializing git repository');
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await fsExtra.outputFile(
          path.join(projectPath, '.gitignore'),
          '.venv/\n__pycache__/\n*.pyc\n.env\n.rapidkit-workspace/\n',
          'utf-8'
        );
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit: RapidKit environment'], {
          cwd: projectPath,
        });
        spinner.succeed('Git repository initialized');
      } catch (_error) {
        spinner.warn('Could not initialize git repository');
      }
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
  } catch (_error) {
    spinner.fail('Failed to create RapidKit environment');
    console.error(chalk.red('\n❌ Error:'), _error);

    // Cleanup on failure
    try {
      await fsExtra.remove(projectPath);
    } catch (_cleanupError) {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Install RapidKit with Poetry
async function installWithPoetry(
  projectPath: string,
  pythonVersion: string,
  spinner: Ora,
  testMode?: boolean,
  userConfig?: UserConfig
) {
  spinner.start('Checking Poetry installation');

  try {
    await execa('poetry', ['--version']);
    spinner.succeed('Poetry found');
  } catch (_error) {
    throw new PoetryNotFoundError();
  }

  spinner.start('Initializing Poetry project');
  await execa('poetry', ['init', '--no-interaction', '--python', `^${pythonVersion}`], {
    cwd: projectPath,
  });

  // Set package-mode = false since this is a workspace, not a package
  const pyprojectPath = path.join(projectPath, 'pyproject.toml');
  const pyprojectContent = await fsPromises.readFile(pyprojectPath, 'utf-8');
  const updatedContent = pyprojectContent.replace(
    '[tool.poetry]',
    '[tool.poetry]\npackage-mode = false'
  );
  await fsPromises.writeFile(pyprojectPath, updatedContent, 'utf-8');

  spinner.succeed('Poetry project initialized');

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
    try {
      await execa('poetry', ['add', 'rapidkit'], { cwd: projectPath });
    } catch (_error) {
      throw new RapidKitNotAvailableError();
    }
  }
  spinner.succeed('RapidKit installed');
}

// Install RapidKit with venv + pip
async function installWithVenv(
  projectPath: string,
  pythonVersion: string,
  spinner: Ora,
  testMode?: boolean,
  userConfig?: UserConfig
) {
  spinner.start(`Checking Python ${pythonVersion}`);

  const pythonCmd = 'python3';
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
  await execa(pythonCmd, ['-m', 'venv', '.venv'], { cwd: projectPath });
  spinner.succeed('Virtual environment created');

  spinner.start('Installing RapidKit');
  const pipPath = path.join(projectPath, '.venv', 'bin', 'pip');
  await execa(pipPath, ['install', '--upgrade', 'pip'], { cwd: projectPath });

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
    await execa(pipPath, ['install', '-e', localPath], { cwd: projectPath });
  } else {
    // Production: Install from PyPI
    spinner.text = 'Installing RapidKit from PyPI';
    try {
      await execa(pipPath, ['install', 'rapidkit'], { cwd: projectPath });
    } catch (_error) {
      throw new RapidKitNotAvailableError();
    }
  }
  spinner.succeed('RapidKit installed');
}

// Install RapidKit with pipx (global)
async function installWithPipx(
  projectPath: string,
  spinner: Ora,
  testMode?: boolean,
  userConfig?: UserConfig
) {
  spinner.start('Checking pipx installation');

  try {
    await execa('pipx', ['--version']);
    spinner.succeed('pipx found');
  } catch (_error) {
    throw new PipxNotFoundError();
  }

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
    await execa('pipx', ['install', '-e', localPath]);
  } else {
    // Production: Install from PyPI
    spinner.text = 'Installing RapidKit from PyPI';
    try {
      await execa('pipx', ['install', 'rapidkit']);
    } catch (_error) {
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

// Create README with usage instructions
async function createReadme(projectPath: string, installMethod: string) {
  const activationCmd =
    installMethod === 'poetry'
      ? 'source $(poetry env info --path)/bin/activate\n# Or simply use: poetry run rapidkit <command>'
      : installMethod === 'venv'
        ? 'source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate'
        : 'N/A (globally installed)';

  const readmeContent = `# RapidKit Workspace

This directory contains a RapidKit development environment.

## Installation Method

**${installMethod === 'poetry' ? 'Poetry' : installMethod === 'venv' ? 'Python venv + pip' : 'pipx (global)'}**

## Getting Started

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

For full documentation, visit: [RapidKit Docs](https://rapidkit.top) *(or appropriate URL)*

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
python = "^3.11"
fastapi = "^0.115.0"
uvicorn = {extras = ["standard"], version = "^0.32.0"}
pydantic = "^2.0"
pydantic-settings = "^2.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0"
pytest-asyncio = "^0.24.0"
pytest-cov = "^6.0"
httpx = "^0.27"
black = "^24.0"
ruff = "^0.8"
mypy = "^1.0"

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
rapidkit init       # Install dependencies
rapidkit dev        # Start dev server
\\\`\\\`\\\`

## Available commands

\\\`\\\`\\\`bash
rapidkit init       # 🔧 Install dependencies
rapidkit dev        # 🚀 Start development server with hot reload
rapidkit start      # ⚡ Start production server
rapidkit test       # 🧪 Run tests
rapidkit help       # 📚 Show available commands
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
  rapidkit init       # Install dependencies
  rapidkit dev        # Start dev server

📚 Available commands:
  rapidkit init       # 🔧 Install dependencies
  rapidkit dev        # 🚀 Start dev server with hot reload
  rapidkit start      # ⚡ Start production server
  rapidkit test       # 🧪 Run tests
  rapidkit help       # 📚 Show help

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
4. **Read the Documentation** - Visit [RapidKit Docs](https://rapidkit.top)

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
    console.log(chalk.gray(`  - Python version: ${userConfig.pythonVersion || '3.11'}`));
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
