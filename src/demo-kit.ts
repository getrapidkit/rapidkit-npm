import { promises as fs } from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { execa } from 'execa';
import { getVersion } from './update-checker.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface KitVariables {
  project_name: string;
  author?: string;
  description?: string;
  app_version?: string;
  license?: string;
  template?: string;
  package_manager?: string;
  skipGit?: boolean;
  skipInstall?: boolean;
}

export async function generateDemoKit(projectPath: string, variables: KitVariables): Promise<void> {
  const template = variables.template || 'fastapi';
  const isFastAPI = template === 'fastapi';
  const templateName = isFastAPI ? 'FastAPI' : 'NestJS';

  const spinner = ora(`Generating ${templateName} project...`).start();

  try {
    // When running from dist/demo-kit.js, we need to go up to package root
    const packageRoot = path.resolve(__dirname, '..');
    const templateDir = isFastAPI ? 'fastapi-standard' : 'nestjs-standard';
    const templatesPath = path.join(packageRoot, 'templates', 'kits', templateDir);

    const env = nunjucks.configure(templatesPath, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
    });

    // Default variables
    const context = {
      project_name: variables.project_name,
      author: variables.author || 'RapidKit User',
      description:
        variables.description ||
        (isFastAPI
          ? 'FastAPI service generated with RapidKit'
          : 'NestJS application generated with RapidKit'),
      app_version: variables.app_version || '0.1.0',
      license: variables.license || 'MIT',
      package_manager: variables.package_manager || 'npm',
      created_at: new Date().toISOString(),
      rapidkit_version: getVersion(),
    };

    // File structure based on template
    let files: string[];

    if (isFastAPI) {
      files = [
        'src/main.py.j2',
        'src/__init__.py.j2',
        'src/cli.py.j2',
        'src/routing/__init__.py.j2',
        'src/routing/health.py.j2',
        'src/modules/__init__.py.j2',
        'tests/__init__.py.j2',
        'README.md.j2',
        'pyproject.toml.j2',
        'Makefile.j2',
        '.rapidkit/__init__.py.j2',
        '.rapidkit/project.json.j2',
        '.rapidkit/cli.py.j2',
        '.rapidkit/rapidkit.j2',
        '.rapidkit/activate.j2',
        'rapidkit.j2',
        'rapidkit.cmd.j2',
      ];
    } else {
      // NestJS files
      files = [
        'src/main.ts.j2',
        'src/app.module.ts.j2',
        'src/app.controller.ts.j2',
        'src/app.service.ts.j2',
        'src/config/configuration.ts.j2',
        'src/config/validation.ts.j2',
        'src/config/index.ts.j2',
        'src/modules/index.ts.j2',
        'src/examples/examples.module.ts.j2',
        'src/examples/examples.controller.ts.j2',
        'src/examples/examples.service.ts.j2',
        'src/examples/dto/create-note.dto.ts.j2',
        'test/app.controller.spec.ts.j2',
        'test/examples.controller.spec.ts.j2',
        'test/app.e2e-spec.ts.j2',
        'test/jest-e2e.json.j2',
        'package.json.j2',
        'tsconfig.json.j2',
        'tsconfig.build.json.j2',
        'nest-cli.json.j2',
        'jest.config.ts.j2',
        '.eslintrc.js.j2',
        '.prettierrc.j2',
        '.nvmrc.j2',
        '.node-version.j2',
        '.env.example.j2',
        'README.md.j2',
        '.rapidkit/project.json.j2',
        '.rapidkit/rapidkit.j2',
        '.rapidkit/rapidkit.cmd.j2',
        '.rapidkit/activate.j2',
        'rapidkit.j2',
        'rapidkit.cmd.j2',
      ];
    }

    // Generate files
    for (const templateFile of files) {
      const templatePath = path.join(templatesPath, templateFile);

      // Check if template file exists
      try {
        await fs.access(templatePath);
      } catch {
        // Template file doesn't exist, skip it
        continue;
      }

      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const rendered = env.renderString(templateContent, context);

      // Output path is the same but without .j2
      const outputFile = templateFile.replace(/\.j2$/, '');
      const outputPath = path.join(projectPath, outputFile);

      // Create directory if needed
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Write file
      await fs.writeFile(outputPath, rendered);

      // Make executable files executable
      if (
        outputFile.endsWith('.rapidkit/rapidkit') ||
        outputFile.endsWith('.rapidkit/cli.py') ||
        outputFile.endsWith('.rapidkit/activate') ||
        outputFile === 'rapidkit'
      ) {
        await fs.chmod(outputPath, 0o755);
      }
    }

    // Create .gitignore separately with proper content
    const gitignoreContent = isFastAPI
      ? `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.venv/
venv/
ENV/
env/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Project specific
.env
.env.local
`
      : `# Node artifacts
node_modules/
dist/
.tmp/
.env
.env.*
!.env.example

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDEs
.idea/
.vscode/

# Coverage
coverage/
`;

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);

    spinner.succeed(`${templateName} project generated!`);

    // Git initialization
    if (!variables.skipGit) {
      const gitSpinner = ora('Initializing git repository...').start();
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa(
          'git',
          ['commit', '-m', `Initial commit: ${templateName} project via RapidKit`],
          {
            cwd: projectPath,
          }
        );
        gitSpinner.succeed('Git repository initialized');
      } catch {
        gitSpinner.warn('Could not initialize git repository');
      }
    }

    // Install dependencies (for NestJS)
    if (!isFastAPI && !variables.skipInstall) {
      const pm = variables.package_manager || 'npm';
      const installSpinner = ora(`Installing dependencies with ${pm}...`).start();
      try {
        const installCmd = pm === 'yarn' ? ['install'] : pm === 'pnpm' ? ['install'] : ['install'];
        await execa(pm, installCmd, { cwd: projectPath });
        installSpinner.succeed('Dependencies installed');
      } catch {
        installSpinner.warn(`Could not install dependencies. Run '${pm} install' manually.`);
      }
    }

    // Success message
    const projectName = path.basename(projectPath);

    if (isFastAPI) {
      console.log(`
${chalk.green('✨ FastAPI project created successfully!')}

${chalk.bold('📂 Project structure:')}
${projectPath}/
  ├── .rapidkit/           # RapidKit CLI module
  ├── src/
  │   ├── main.py          # FastAPI application
  │   ├── cli.py           # CLI commands
  │   ├── routing/         # API routes
  │   └── modules/         # Module system
  ├── tests/               # Test suite
  ├── pyproject.toml       # Poetry configuration
  └── README.md

${chalk.bold('🚀 Get started:')}
  ${chalk.cyan(`cd ${projectName}`)}
  ${chalk.cyan('rapidkit init')}               ${chalk.gray('# Install dependencies')}
  ${chalk.cyan('rapidkit dev')}                ${chalk.gray('# Start dev server')}

${chalk.bold('📚 Available rapidkit commands:')}
  rapidkit init      # Install dependencies (poetry install)
  rapidkit dev       # Start dev server with hot reload
  rapidkit start     # Start production server
  rapidkit test      # Run tests
  rapidkit lint      # Lint code
  rapidkit format    # Format code

${chalk.gray('Alternative: use make commands (make dev, make test, ...)')}
${chalk.gray('For full RapidKit CLI features, install the Python package:')}
  ${chalk.cyan('pipx install rapidkit')}
`);
    } else {
      console.log(`
${chalk.green('✨ NestJS project created successfully!')}

${chalk.bold('📂 Project structure:')}
${projectPath}/
  ├── .rapidkit/           # RapidKit CLI module
  ├── src/
  │   ├── main.ts              # Application entry point
  │   ├── app.module.ts        # Root module
  │   ├── config/              # Configuration
  │   └── examples/            # Example module
  ├── test/                    # Test files
  ├── package.json             # Dependencies
  └── README.md

${chalk.bold('🚀 Get started:')}
  ${chalk.cyan(`cd ${projectName}`)}
  ${chalk.cyan('rapidkit init')}               ${chalk.gray('# Install dependencies')}
  ${chalk.cyan('cp .env.example .env')}
  ${chalk.cyan('rapidkit dev')}                ${chalk.gray('# Start dev server')}

${chalk.bold('📚 Available rapidkit commands:')}
  rapidkit init      # Install dependencies
  rapidkit dev       # Start dev server with hot reload
  rapidkit start     # Start production server
  rapidkit build     # Build for production
  rapidkit test      # Run tests
  rapidkit lint      # Lint code
  rapidkit format    # Format code

${chalk.bold('🌐 API endpoints:')}
  http://localhost:8000/health          # Health check
  http://localhost:8000/docs            # Swagger docs
  http://localhost:8000/examples/notes  # Example API

${chalk.gray('For full RapidKit CLI features, install the Python package:')}
  ${chalk.cyan('pipx install rapidkit')}
`);
    }
  } catch (error) {
    spinner.fail(`Failed to generate ${templateName} project`);
    throw error;
  }
}
