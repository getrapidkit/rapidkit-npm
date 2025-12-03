import { promises as fs } from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface KitVariables {
  project_name: string;
  author?: string;
  description?: string;
  app_version?: string;
  license?: string;
}

export async function generateDemoKit(projectPath: string, variables: KitVariables): Promise<void> {
  const spinner = ora('Generating FastAPI demo project...').start();

  try {
    // When running from dist/demo-kit.js, we need to go up to package root
    // dist/demo-kit.js -> .. (package root) -> templates/kits/fastapi-standard
    const packageRoot = path.resolve(__dirname, '..');
    const templatesPath = path.join(packageRoot, 'templates', 'kits', 'fastapi-standard');

    const env = nunjucks.configure(templatesPath, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
    });

    // Default variables
    const context = {
      project_name: variables.project_name,
      author: variables.author || 'RapidKit User',
      description: variables.description || 'FastAPI service generated with RapidKit',
      app_version: variables.app_version || '0.1.0',
      license: variables.license || 'MIT',
    };

    // File structure to create
    const files = [
      'src/main.py.j2',
      'src/__init__.py.j2',
      'src/cli.py.j2',
      'src/routing/__init__.py.j2',
      'src/routing/health.py.j2',
      'src/modules/__init__.py.j2',
      'tests/__init__.py.j2',
      'README.md.j2',
      'pyproject.toml.j2',
      // .rapidkit folder for project detection and local commands
      '.rapidkit/project.json.j2',
      '.rapidkit/cli.py.j2',
      '.rapidkit/rapidkit.j2',
    ];

    // Generate files
    for (const templateFile of files) {
      const templatePath = path.join(templatesPath, templateFile);
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      const rendered = env.renderString(templateContent, context);

      // Output path is the same but without .j2
      const outputFile = templateFile.replace(/\.j2$/, '');
      const outputPath = path.join(projectPath, outputFile);

      // Create directory if needed
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Write file
      await fs.writeFile(outputPath, rendered);

      // Make .rapidkit/rapidkit and .rapidkit/cli.py executable
      if (outputFile === '.rapidkit/rapidkit' || outputFile === '.rapidkit/cli.py') {
        await fs.chmod(outputPath, 0o755);
      }
    }

    // Create .gitignore separately
    const gitignoreContent = `# Python
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
`;
    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);

    spinner.succeed('FastAPI demo project generated!');

    console.log(`
${chalk.green('✨ Demo project created successfully!')}

${chalk.bold('📂 Project structure:')}
${projectPath}/
  ├── .rapidkit/           # RapidKit project config
  │   ├── project.json     # Project metadata
  │   ├── cli.py           # Local CLI handler
  │   └── rapidkit         # Local launcher
  ├── src/
  │   ├── main.py          # FastAPI application
  │   ├── cli.py           # CLI commands
  │   ├── routing/         # API routes
  │   └── modules/         # Module system
  ├── tests/               # Test suite
  ├── pyproject.toml       # Poetry configuration
  └── README.md

${chalk.bold('🚀 Get started:')}
  cd ${path.basename(projectPath)}
  poetry install
  rapidkit dev             # or: poetry run python -m src.main

${chalk.bold('📚 Available commands:')}
  rapidkit init            # Install dependencies
  rapidkit dev             # Start dev server with hot reload
  rapidkit start           # Start production server
  rapidkit test            # Run tests
  rapidkit lint            # Lint code
  rapidkit format          # Format code

${chalk.yellow('Note:')} This is a standalone demo. For full RapidKit features and modules,
install RapidKit Python package: ${chalk.cyan('pipx install rapidkit')}
`);
  } catch (error) {
    spinner.fail('Failed to generate demo project');
    throw error;
  }
}
