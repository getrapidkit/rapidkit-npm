import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import validatePackageName from 'validate-npm-package-name';
import { generateProjectFiles, type ProjectConfig } from './generator.js';

interface CLIOptions {
  framework?: string;
  modules?: string[];
  skipInstall?: boolean;
  skipGit?: boolean;
}

const AVAILABLE_MODULES = [
  { name: 'Authentication & JWT', value: 'auth', checked: true },
  { name: 'Database ORM (Professional)', value: 'database-orm-pro' },
  { name: 'Caching (Redis)', value: 'caching' },
  { name: 'File Upload & Storage', value: 'file-upload' },
  { name: 'Email Service', value: 'email' },
  { name: 'Logging & Monitoring', value: 'logging' },
  { name: 'Rate Limiting', value: 'rate-limiting' },
  { name: 'WebSocket Support', value: 'websocket' },
];

export async function createProject(projectName: string | undefined, options: CLIOptions) {
  // Step 1: Get project name
  let name = projectName;
  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        default: 'my-rapidkit-app',
        validate: (input: string) => {
          const validation = validatePackageName(input);
          if (!validation.validForNewPackages) {
            return validation.errors?.[0] || 'Invalid project name';
          }
          return true;
        },
      },
    ]);
    name = answers.projectName;
  }

  if (!name) {
    console.log(chalk.red('\n❌ Project name is required!'));
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), name);

  // Check if directory exists
  if (await fs.pathExists(projectPath)) {
    console.log(chalk.red(`\n❌ Directory "${name}" already exists!`));
    process.exit(1);
  }

  // Step 2: Framework selection
  let framework = options.framework;
  if (!framework) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which framework would you like to use?',
        choices: [
          { name: '🐍 FastAPI (Standard)', value: 'fastapi-standard' },
          { name: '🐍 FastAPI (Advanced)', value: 'fastapi-advanced' },
          { name: '🟢 NestJS (Standard)', value: 'nestjs-standard' },
          { name: '🟢 NestJS (Advanced)', value: 'nestjs-advanced' },
        ],
      },
    ]);
    framework = answers.framework;
  }

  if (!framework) {
    console.log(chalk.red('\n❌ Framework selection is required!'));
    process.exit(1);
  }

  const isFastAPI = framework.startsWith('fastapi');

  // Step 3: Python/Node configuration
  let pythonVersion = '3.11';
  let packageManager: 'poetry' | 'pip' | 'npm' = 'pip';

  if (isFastAPI) {
    const pythonAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'pythonVersion',
        message: 'Select Python version:',
        choices: ['3.10', '3.11', '3.12'],
        default: '3.11',
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Select package manager:',
        choices: [
          { name: 'Poetry (Recommended)', value: 'poetry' },
          { name: 'pip', value: 'pip' },
        ],
        default: 'poetry',
      },
    ]);
    pythonVersion = pythonAnswers.pythonVersion;
    packageManager = pythonAnswers.packageManager;
  }

  // Step 4: Module selection
  let selectedModules = options.modules || [];
  if (!options.modules) {
    const moduleAnswers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'modules',
        message: 'Select modules to include:',
        choices: AVAILABLE_MODULES,
      },
    ]);
    selectedModules = moduleAnswers.modules;
  }

  // Step 5: Additional options
  const optionsAnswers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'includeDocker',
      message: 'Include Docker configuration?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'includeTesting',
      message: 'Include testing setup?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'includeCI',
      message: 'Include CI/CD (GitHub Actions)?',
      default: true,
    },
  ]);

  // Build configuration
  const config: ProjectConfig = {
    projectName: name,
    framework: framework as any,
    pythonVersion: pythonVersion as any,
    packageManager: packageManager as any,
    selectedModules,
    includeDocker: optionsAnswers.includeDocker,
    includeTesting: optionsAnswers.includeTesting,
    includeCI: optionsAnswers.includeCI,
  };

  // Generate project
  console.log(chalk.blue('\n📦 Generating project files...\n'));
  const spinner = ora('Creating project structure').start();

  try {
    // Create directory
    await fs.ensureDir(projectPath);

    // Generate files
    const files = generateProjectFiles(config);

    // Write files
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(projectPath, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, 'utf-8');
    }

    // Create .rapidkit directory with metadata
    const rapidkitDir = path.join(projectPath, '.rapidkit');
    await fs.ensureDir(rapidkitDir);
    const projectMetadata = {
      framework: config.framework,
      created_at: new Date().toISOString(),
      rapidkit_version: '0.1.0',
      modules: config.selectedModules,
      config: {
        pythonVersion: config.pythonVersion,
        packageManager: config.packageManager,
        includeDocker: config.includeDocker,
        includeTesting: config.includeTesting,
        includeCI: config.includeCI,
      },
    };
    await fs.writeFile(
      path.join(rapidkitDir, 'project.json'),
      JSON.stringify(projectMetadata, null, 2),
      'utf-8'
    );

    spinner.succeed('Project structure created');

    // Git initialization
    if (!options.skipGit) {
      const gitSpinner = ora('Initializing git repository').start();
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit from create-rapidkit'], {
          cwd: projectPath,
        });
        gitSpinner.succeed('Git repository initialized');
      } catch (error) {
        gitSpinner.warn('Git initialization skipped');
      }
    }

    // Install dependencies
    if (!options.skipInstall) {
      const installSpinner = ora('Installing dependencies').start();
      try {
        if (isFastAPI) {
          if (packageManager === 'poetry') {
            await execa('poetry', ['install'], { cwd: projectPath });
          } else {
            await execa('pip', ['install', '-r', 'requirements.txt'], { cwd: projectPath });
          }
        } else {
          // Detect package manager
          const hasYarn = await commandExists('yarn');
          const hasPnpm = await commandExists('pnpm');
          
          if (hasPnpm) {
            await execa('pnpm', ['install'], { cwd: projectPath });
          } else if (hasYarn) {
            await execa('yarn', ['install'], { cwd: projectPath });
          } else {
            await execa('npm', ['install'], { cwd: projectPath });
          }
        }
        installSpinner.succeed('Dependencies installed');
      } catch (error) {
        installSpinner.fail('Failed to install dependencies');
        console.log(chalk.yellow('\n⚠️  You can install dependencies manually later.'));
      }
    }

    // Success message
    console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
    console.log(chalk.cyan('📂 Project location:'), projectPath);
    console.log(chalk.cyan('\n🚀 Next steps:\n'));
    console.log(chalk.white(`  cd ${name}`));
    
    if (isFastAPI) {
      if (packageManager === 'poetry') {
        console.log(chalk.white('  poetry run uvicorn src.main:app --reload'));
      } else {
        console.log(chalk.white('  pip install -r requirements.txt'));
        console.log(chalk.white('  uvicorn src.main:app --reload'));
      }
    } else {
      console.log(chalk.white('  npm run start:dev'));
    }

    console.log(chalk.cyan('\n📖 Documentation:'), 'https://rapidkit.dev/docs');
    console.log(chalk.cyan('💬 Community:'), 'https://github.com/getrapidkit/rapidkit\n');
  } catch (error) {
    spinner.fail('Failed to create project');
    throw error;
  }
}

async function commandExists(command: string): Promise<boolean> {
  try {
    await execa('which', [command]);
    return true;
  } catch {
    return false;
  }
}
