import * as fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { execa } from 'execa';

export interface CLIOptions {
  skipGit?: boolean;
}

export async function createProject(projectName: string | undefined, options: CLIOptions) {
  // Default to 'rapidkit' directory
  const name = projectName || 'rapidkit';
  const projectPath = path.resolve(process.cwd(), name);

  // Check if directory exists
  if (await fs.pathExists(projectPath)) {
    console.log(chalk.red(`\n❌ Directory "${name}" already exists!`));
    console.log(chalk.yellow('💡 Please choose a different name or remove the existing directory.\n'));
    process.exit(1);
  }

  // Step 1: Choose Python version and install method
  const pythonAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'pythonVersion',
      message: 'Select Python version for RapidKit:',
      choices: ['3.10', '3.11', '3.12'],
      default: '3.11',
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
      default: 'poetry',
    },
  ]);

  console.log(chalk.blue('\n📦 Setting up RapidKit environment...\n'));
  const spinner = ora('Creating directory').start();

  try {
    // Create directory
    await fs.ensureDir(projectPath);
    spinner.succeed('Directory created');

    // Install RapidKit based on method
    if (pythonAnswers.installMethod === 'poetry') {
      await installWithPoetry(projectPath, pythonAnswers.pythonVersion, spinner);
    } else if (pythonAnswers.installMethod === 'venv') {
      await installWithVenv(projectPath, pythonAnswers.pythonVersion, spinner);
    } else {
      await installWithPipx(projectPath, spinner);
    }

    // Create README with instructions
    await createReadme(projectPath, pythonAnswers.installMethod);

    spinner.succeed('RapidKit environment ready!');

    // Git initialization
    if (!options.skipGit) {
      spinner.start('Initializing git repository');
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await fs.writeFile(
          path.join(projectPath, '.gitignore'),
          '.venv/\n__pycache__/\n*.pyc\n.env\n.rapidkit-workspace/\n',
          'utf-8'
        );
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit: RapidKit environment'], {
          cwd: projectPath,
        });
        spinner.succeed('Git repository initialized');
      } catch (error) {
        spinner.warn('Could not initialize git repository');
      }
    }

    // Success message
    console.log(chalk.green('\n✨ RapidKit environment created successfully!\n'));
    console.log(chalk.cyan('📂 Location:'), chalk.white(projectPath));
    console.log(chalk.cyan('🚀 Get started:\n'));
    console.log(chalk.white(`   cd ${name}`));

    if (pythonAnswers.installMethod === 'poetry') {
      console.log(chalk.white('   poetry shell'));
      console.log(chalk.white('   rapidkit create my-project'));
    } else if (pythonAnswers.installMethod === 'venv') {
      console.log(chalk.white('   source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate'));
      console.log(chalk.white('   rapidkit create my-project'));
    } else {
      console.log(chalk.white('   rapidkit create my-project'));
    }

    console.log(chalk.white('\n💡 For more information, check the README.md file.'));
    console.log(chalk.cyan('\n📚 RapidKit commands:'));
    console.log(chalk.white('   rapidkit create <name>   - Create a new project'));
    console.log(chalk.white('   rapidkit add <module>    - Add a module to your project'));
    console.log(chalk.white('   rapidkit list            - List available kits'));
    console.log(chalk.white('   rapidkit modules         - List available modules'));
    console.log(chalk.white('   rapidkit --help          - Show all commands\n'));
  } catch (error) {
    spinner.fail('Failed to create RapidKit environment');
    console.error(chalk.red('\n❌ Error:'), error);

    // Cleanup on failure
    try {
      await fs.remove(projectPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Install RapidKit with Poetry
async function installWithPoetry(projectPath: string, pythonVersion: string, spinner: Ora) {
  spinner.start('Checking Poetry installation');

  try {
    await execa('poetry', ['--version']);
    spinner.succeed('Poetry found');
  } catch (error) {
    spinner.fail('Poetry not found');
    console.log(chalk.yellow('\n⚠️  Poetry is not installed.'));
    console.log(chalk.cyan('Install Poetry: https://python-poetry.org/docs/#installation\n'));
    process.exit(1);
  }

  spinner.start('Initializing Poetry project');
  await execa('poetry', ['init', '--no-interaction', '--python', `^${pythonVersion}`], {
    cwd: projectPath,
  });
  spinner.succeed('Poetry project initialized');

  spinner.start('Installing RapidKit');
  await execa('poetry', ['add', 'rapidkit'], { cwd: projectPath });
  spinner.succeed('RapidKit installed');
}

// Install RapidKit with venv + pip
async function installWithVenv(projectPath: string, pythonVersion: string, spinner: Ora) {
  spinner.start(`Checking Python ${pythonVersion}`);

  let pythonCmd = 'python3';
  try {
    const { stdout } = await execa(pythonCmd, ['--version']);
    const version = stdout.match(/Python (\d+\.\d+)/)?.[1];

    if (version && parseFloat(version) < parseFloat(pythonVersion)) {
      throw new Error(`Python ${pythonVersion}+ required, found ${version}`);
    }

    spinner.succeed(`Python ${version} found`);
  } catch (error) {
    spinner.fail('Python not found or version too old');
    console.log(chalk.red('\n❌ Python 3.10+ is required.'));
    console.log(chalk.cyan('Install Python: https://www.python.org/downloads/\n'));
    process.exit(1);
  }

  spinner.start('Creating virtual environment');
  await execa(pythonCmd, ['-m', 'venv', '.venv'], { cwd: projectPath });
  spinner.succeed('Virtual environment created');

  spinner.start('Installing RapidKit');
  const pipPath = path.join(projectPath, '.venv', 'bin', 'pip');
  await execa(pipPath, ['install', '--upgrade', 'pip'], { cwd: projectPath });
  await execa(pipPath, ['install', 'rapidkit'], { cwd: projectPath });
  spinner.succeed('RapidKit installed');
}

// Install RapidKit with pipx (global)
async function installWithPipx(projectPath: string, spinner: Ora) {
  spinner.start('Checking pipx installation');

  try {
    await execa('pipx', ['--version']);
    spinner.succeed('pipx found');
  } catch (error) {
    spinner.fail('pipx not found');
    console.log(chalk.yellow('\n⚠️  pipx is not installed.'));
    console.log(chalk.cyan('Install pipx: https://pypa.github.io/pipx/installation/\n'));
    process.exit(1);
  }

  spinner.start('Installing RapidKit globally with pipx');
  await execa('pipx', ['install', 'rapidkit']);
  spinner.succeed('RapidKit installed globally');

  // Create a simple marker file
  await fs.writeFile(
    path.join(projectPath, '.rapidkit-global'),
    'RapidKit installed globally with pipx\n',
    'utf-8'
  );
}

// Create README with usage instructions
async function createReadme(projectPath: string, installMethod: string) {
  const activationCmd =
    installMethod === 'poetry'
      ? 'poetry shell'
      : installMethod === 'venv'
        ? 'source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate'
        : 'N/A (globally installed)';

  const readme = `# RapidKit Workspace

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
rapidkit create my-project
\`\`\`

Choose a kit (e.g., fastapi.standard) and follow the prompts.

### 3. Navigate and Run

\`\`\`bash
cd my-project
# For FastAPI projects:
uvicorn src.main:app --reload
\`\`\`

## Available Commands

- \`rapidkit create <name>\` - Create a new project
- \`rapidkit add <module>\` - Add a module to existing project
- \`rapidkit list\` - List available kits
- \`rapidkit modules\` - List available modules
- \`rapidkit upgrade\` - Upgrade RapidKit
- \`rapidkit doctor\` - Check system requirements
- \`rapidkit --help\` - Show all commands

## RapidKit Documentation

For full documentation, visit: [RapidKit Docs](https://rapidkit.dev) *(or appropriate URL)*

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
3. Run system check: \`rapidkit doctor\`

---

Generated by create-rapidkit
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme, 'utf-8');
}
