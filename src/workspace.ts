import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { getVersion } from './update-checker.js';

interface WorkspaceOptions {
  name: string;
  author: string;
  skipGit?: boolean;
}

export async function createWorkspace(
  workspacePath: string,
  options: WorkspaceOptions
): Promise<void> {
  const spinner = ora('Creating RapidKit workspace...').start();

  try {
    // Create workspace directory
    await fs.mkdir(workspacePath, { recursive: true });

    // Create .rapidkit directory
    await fs.mkdir(path.join(workspacePath, '.rapidkit'), { recursive: true });

    // Create config.json
    const config = {
      workspace_name: options.name,
      author: options.author,
      rapidkit_version: getVersion(),
      created_at: new Date().toISOString(),
      type: 'workspace',
    };
    await fs.writeFile(
      path.join(workspacePath, '.rapidkit', 'config.json'),
      JSON.stringify(config, null, 2)
    );

    // Create the main rapidkit CLI script
    const cliScript = generateCLIScript();
    await fs.writeFile(path.join(workspacePath, 'rapidkit'), cliScript);
    await fs.chmod(path.join(workspacePath, 'rapidkit'), 0o755);

    // Create README.md
    const readme = generateReadme(options.name);
    await fs.writeFile(path.join(workspacePath, 'README.md'), readme);

    // Create .gitignore
    const gitignore = `# RapidKit workspace
.env
.env.*
!.env.example

# OS
.DS_Store
Thumbs.db

# IDEs
.vscode/
.idea/

# Logs
*.log
`;
    await fs.writeFile(path.join(workspacePath, '.gitignore'), gitignore);

    // Create VS Code extension-compatible workspace marker for auto-detection.
    await fs.writeFile(
      path.join(workspacePath, '.rapidkit-workspace'),
      JSON.stringify(
        {
          signature: 'RAPIDKIT_VSCODE_WORKSPACE',
          createdBy: 'rapidkit-npm',
          version: getVersion(),
          createdAt: new Date().toISOString(),
          name: options.name,
        },
        null,
        2
      )
    );

    // Copy templates to workspace
    await copyTemplates(workspacePath);

    spinner.succeed('Workspace created!');

    // Git initialization
    if (!options.skipGit) {
      const gitSpinner = ora('Initializing git repository...').start();
      try {
        await execa('git', ['init'], { cwd: workspacePath });
        await execa('git', ['add', '.'], { cwd: workspacePath });
        await execa('git', ['commit', '-m', 'Initial commit: RapidKit workspace'], {
          cwd: workspacePath,
        });
        gitSpinner.succeed('Git repository initialized');
      } catch {
        gitSpinner.warn('Could not initialize git repository');
      }
    }

    // Success message
    console.log(`
${chalk.green('✨ RapidKit workspace created successfully!')}

${chalk.bold('📂 Workspace structure:')}
${workspacePath}/
  ├── rapidkit            # Local CLI wrapper
  ├── .rapidkit/          # Workspace configuration
  │   ├── config.json     # Workspace settings
  │   └── templates/      # Project templates
  └── README.md

${chalk.bold('🚀 Get started:')}
  ${chalk.cyan(`cd ${options.name}`)}
  ${chalk.cyan('npx rapidkit my-api --template fastapi')}
  ${chalk.cyan('cd my-api')}
  ${chalk.cyan('npx rapidkit init')}
  ${chalk.cyan('npx rapidkit dev')}

${chalk.bold('📦 Available templates:')}
  fastapi   - FastAPI + Python (default)
  nestjs    - NestJS + TypeScript

${chalk.bold('📚 Commands:')}
  npx rapidkit <name> --template <type>   Create a new project
  npx rapidkit init                       Install dependencies
  npx rapidkit dev                        Start dev server
  npx rapidkit help                       Show all commands

${chalk.gray('Alternative: ./rapidkit dev, make dev')}
${chalk.gray('💡 Tip: Install globally (npm i -g rapidkit) to use without npx')}\n`);
  } catch (error) {
    spinner.fail('Failed to create workspace');
    throw error;
  }
}

function generateCLIScript(): string {
  return `#!/usr/bin/env bash
#
# RapidKit CLI - Local workspace commands
# This script provides rapidkit commands within the workspace
#

set -e

# Find workspace root (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

# Check if we're in a project directory (has .rapidkit/project.json)
find_project_root() {
    local dir="$PWD"
    while [[ "$dir" != "/" ]]; do
        if [[ -f "$dir/.rapidkit/project.json" ]]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Check if we're in a workspace (has .rapidkit/config.json with type=workspace)
find_workspace_root() {
    local dir="$PWD"
    while [[ "$dir" != "/" ]]; do
        if [[ -f "$dir/.rapidkit/config.json" ]]; then
            if grep -q '"type": "workspace"' "$dir/.rapidkit/config.json" 2>/dev/null; then
                echo "$dir"
                return 0
            fi
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[0;33m'
BLUE='\\033[0;34m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color
BOLD='\\033[1m'

print_banner() {
    echo -e "\${BLUE}\${BOLD}🚀 RapidKit CLI\${NC}"
    echo ""
}

print_help() {
    print_banner
    echo -e "\${BOLD}Usage:\${NC} rapidkit <command> [options]"
    echo ""
    echo -e "\${BOLD}🏗️  Workspace Commands:\${NC}"
    echo "  create <name>         Create a new project from template"
    echo "  create --help         Show create command options"
    echo ""
    echo -e "\${BOLD}🚀 Project Commands\${NC} (run inside a project):"
    echo "  init                  Install project dependencies"
    echo "  dev                   Start development server"
    echo "  start                 Start production server"
    echo "  build                 Build for production"
    echo "  test                  Run tests"
    echo "  lint                  Run linting"
    echo "  format                Format code"
    echo ""
    echo -e "\${BOLD}📚 Other Commands:\${NC}"
    echo "  help                  Show this help message"
    echo "  version               Show version"
    echo ""
    echo -e "\${BOLD}Examples:\${NC}"
    echo -e "  \${CYAN}rapidkit create my-api --template fastapi\${NC}"
    echo -e "  \${CYAN}rapidkit create my-app --template nestjs --yes\${NC}"
    echo -e "  \${CYAN}cd my-api && rapidkit dev\${NC}"
    echo ""
}

print_create_help() {
    print_banner
    echo -e "\${BOLD}Usage:\${NC} rapidkit create <project-name> [options]"
    echo ""
    echo -e "\${BOLD}Options:\${NC}"
    echo "  -t, --template <name>   Template to use (fastapi, nestjs)"
    echo "  -y, --yes               Skip prompts, use defaults"
    echo "  --skip-git              Skip git initialization"
    echo "  --skip-install          Skip dependency installation"
    echo ""
    echo -e "\${BOLD}Templates:\${NC}"
    echo "  fastapi    FastAPI + Python (default)"
    echo "  nestjs     NestJS + TypeScript"
    echo ""
    echo -e "\${BOLD}Examples:\${NC}"
    echo -e "  \${CYAN}rapidkit create my-api\${NC}"
    echo -e "  \${CYAN}rapidkit create my-api --template fastapi\${NC}"
    echo -e "  \${CYAN}rapidkit create my-app --template nestjs --yes\${NC}"
    echo ""
}

# Create project command
cmd_create() {
    local project_name=""
    local template="fastapi"
    local yes_flag=""
    local skip_git=""
    local skip_install=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                print_create_help
                exit 0
                ;;
            -t|--template)
                template="$2"
                shift 2
                ;;
            -y|--yes)
                yes_flag="--yes"
                shift
                ;;
            --skip-git)
                skip_git="--skip-git"
                shift
                ;;
            --skip-install)
                skip_install="--skip-install"
                shift
                ;;
            -*)
                echo -e "\${RED}❌ Unknown option: $1\${NC}"
                print_create_help
                exit 1
                ;;
            *)
                if [[ -z "$project_name" ]]; then
                    project_name="$1"
                fi
                shift
                ;;
        esac
    done

    # Validate template
    if [[ "$template" != "fastapi" && "$template" != "nestjs" ]]; then
        echo -e "\${RED}❌ Invalid template: $template\${NC}"
        echo -e "Available templates: fastapi, nestjs"
        exit 1
    fi

    # If no project name, prompt for it or show help
    if [[ -z "$project_name" ]]; then
        if [[ -n "$yes_flag" ]]; then
            project_name="my-\${template}-project"
        else
            echo -e "\${YELLOW}Project name required\${NC}"
            echo ""
            print_create_help
            exit 1
        fi
    fi

    # Find workspace root
    local workspace_root
    workspace_root=$(find_workspace_root) || {
        echo -e "\${RED}❌ Not in a RapidKit workspace\${NC}"
        echo -e "Run this command from within a RapidKit workspace."
        exit 1
    }

    local project_path="$PWD/$project_name"

    # Check if project already exists
    if [[ -d "$project_path" ]]; then
        echo -e "\${RED}❌ Directory '$project_name' already exists\${NC}"
        exit 1
    fi

    echo -e "\${BLUE}\${BOLD}🚀 Creating $template project: $project_name\${NC}"
    echo ""

    # Use Node.js generator script
    local generator_script="$workspace_root/.rapidkit/generator.js"
    
    if [[ -f "$generator_script" ]]; then
        node "$generator_script" "$project_path" "$template" "$yes_flag" "$skip_git" "$skip_install"
    else
        echo -e "\${RED}❌ Generator script not found\${NC}"
        exit 1
    fi
}

# Project commands (dev, build, test, etc.)
cmd_project() {
    local cmd="$1"
    shift

    # Find project root
    local project_root
    project_root=$(find_project_root) || {
        echo -e "\${RED}❌ Not in a RapidKit project\${NC}"
        echo -e "Run this command from within a project directory."
        echo -e "Use \${CYAN}rapidkit create <name>\${NC} to create a new project."
        exit 1
    }

    # Read project type from project.json
    local project_json="$project_root/.rapidkit/project.json"
    local kit_name
    kit_name=$(grep -o '"kit_name": *"[^"]*"' "$project_json" | cut -d'"' -f4)

    cd "$project_root"

    case "$kit_name" in
        fastapi.standard|python)
            # Python/FastAPI project
            case "$cmd" in
                init)
                    echo -e "\${BLUE}📦 Installing dependencies...\${NC}"
                    
                    # Source activate script first to ensure Poetry is available
                    if [[ -f ".rapidkit/activate" ]]; then
                        source .rapidkit/activate
                    fi
                    
                    poetry install
                    echo -e "\${GREEN}✅ Dependencies installed!\${NC}"
                    ;;
                dev)
                    echo -e "\${BLUE}🚀 Starting development server...\${NC}"
                    poetry run dev "$@"
                    ;;
                start)
                    echo -e "\${BLUE}⚡ Starting production server...\${NC}"
                    poetry run start "$@"
                    ;;
                build)
                    echo -e "\${BLUE}📦 Building project...\${NC}"
                    poetry run build
                    ;;
                test)
                    echo -e "\${BLUE}🧪 Running tests...\${NC}"
                    poetry run test
                    ;;
                lint)
                    echo -e "\${BLUE}🔧 Running linter...\${NC}"
                    poetry run lint
                    ;;
                format)
                    echo -e "\${BLUE}✨ Formatting code...\${NC}"
                    poetry run format
                    ;;
                *)
                    echo -e "\${RED}❌ Unknown command: $cmd\${NC}"
                    exit 1
                    ;;
            esac
            ;;
        nestjs.standard|node)
            # Node/NestJS project
            local pm="npm"
            if command -v pnpm &>/dev/null && [[ -f "pnpm-lock.yaml" ]]; then
                pm="pnpm"
            elif command -v yarn &>/dev/null && [[ -f "yarn.lock" ]]; then
                pm="yarn"
            fi

            case "$cmd" in
                init)
                    echo -e "\${BLUE}📦 Installing dependencies...\${NC}"
                    
                    # Source activate script first to ensure environment is ready
                    if [[ -f ".rapidkit/activate" ]]; then
                        source .rapidkit/activate
                    fi
                    
                    $pm install
                    echo -e "\${GREEN}✅ Dependencies installed!\${NC}"
                    ;;
                dev)
                    echo -e "\${BLUE}🚀 Starting development server...\${NC}"
                    $pm run start:dev
                    ;;
                start)
                    echo -e "\${BLUE}⚡ Starting production server...\${NC}"
                    $pm run start:prod
                    ;;
                build)
                    echo -e "\${BLUE}📦 Building project...\${NC}"
                    $pm run build
                    ;;
                test)
                    echo -e "\${BLUE}🧪 Running tests...\${NC}"
                    $pm test
                    ;;
                lint)
                    echo -e "\${BLUE}🔧 Running linter...\${NC}"
                    $pm run lint
                    ;;
                format)
                    echo -e "\${BLUE}✨ Formatting code...\${NC}"
                    $pm run format
                    ;;
                *)
                    echo -e "\${RED}❌ Unknown command: $cmd\${NC}"
                    exit 1
                    ;;
            esac
            ;;
        *)
            echo -e "\${RED}❌ Unknown project type: $kit_name\${NC}"
            exit 1
            ;;
    esac
}

# Main command handler
main() {
    local cmd="\${1:-help}"
    shift || true

    case "$cmd" in
        create)
            cmd_create "$@"
            ;;
        init|dev|start|build|test|lint|format)
            cmd_project "$cmd" "$@"
            ;;
        help|-h|--help)
            print_help
            ;;
        version|-v|--version)
            echo "RapidKit CLI (npm workspace) v${getVersion()}"
            ;;
        *)
            echo -e "\${RED}❌ Unknown command: $cmd\${NC}"
            echo ""
            print_help
            exit 1
            ;;
    esac
}

main "$@"
`;
}

function generateReadme(workspaceName: string): string {
  return `# ${workspaceName}

RapidKit workspace for building API projects.

## Quick Start

\`\`\`bash
# Add rapidkit to PATH (or use ./rapidkit)
export PATH="$PWD:$PATH"

# Create a FastAPI project
npx rapidkit my-api --template fastapi

# Or create a NestJS project
npx rapidkit my-app --template nestjs

# Enter project and start development
cd my-api
npx rapidkit init    # Install dependencies
npx rapidkit dev     # Start dev server
\`\`\`

## Available Templates

| Template | Stack | Description |
|----------|-------|-------------|
| \`fastapi\` | Python + FastAPI | High-performance Python API |
| \`nestjs\` | TypeScript + NestJS | Enterprise Node.js framework |

## Commands

### Commands

| Command | Description |
|---------|-------------|
| \`npx rapidkit <name> --template <type>\` | Create a new project |
| \`npx rapidkit init\` | Install dependencies |
| \`npx rapidkit dev\` | Start development server |
| \`npx rapidkit start\` | Start production server |
| \`npx rapidkit build\` | Build for production |
| \`npx rapidkit test\` | Run tests |
| \`npx rapidkit lint\` | Run linting |
| \`npx rapidkit format\` | Format code |

## Learn More

- [RapidKit Documentation](https://rapidkit.dev)
- [GitHub Repository](https://github.com/Baziar/rapidkit)
`;
}

async function copyTemplates(workspacePath: string): Promise<void> {
  const { fileURLToPath } = await import('url');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Templates source (from npm package)
  const packageRoot = path.resolve(__dirname, '..');
  const templatesSource = path.join(packageRoot, 'templates', 'kits');
  const templatesDest = path.join(workspacePath, '.rapidkit', 'templates');

  // Copy templates
  const { default: fsExtra } = await import('fs-extra');
  await fsExtra.copy(templatesSource, templatesDest);

  // Copy generator script
  const generatorSource = path.join(packageRoot, 'templates', 'generator.js');
  const generatorDest = path.join(workspacePath, '.rapidkit', 'generator.js');
  await fsExtra.copy(generatorSource, generatorDest);
}

// ============================================
// Direct Project Creation (without workspace)
// ============================================

interface ProjectOptions {
  name: string;
  template: string;
  author: string;
  description?: string;
  package_manager?: string;
  skipGit?: boolean;
  skipInstall?: boolean;
}

export async function createProject(projectPath: string, options: ProjectOptions): Promise<void> {
  const isFastAPI = options.template === 'fastapi';
  const templateName = isFastAPI ? 'FastAPI' : 'NestJS';

  const spinner = ora(`Creating ${templateName} project...`).start();

  try {
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Templates source (from npm package)
    const packageRoot = path.resolve(__dirname, '..');
    const templateDir = isFastAPI ? 'fastapi-standard' : 'nestjs-standard';
    const templatesPath = path.join(packageRoot, 'templates', 'kits', templateDir);

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    // Build context
    const context = {
      project_name: isFastAPI
        ? options.name.replace(/-/g, '_').toLowerCase()
        : options.name.replace(/_/g, '-').toLowerCase(),
      author: options.author,
      description: options.description || `${templateName} application generated with RapidKit`,
      app_version: '0.1.0',
      license: 'MIT',
      package_manager: options.package_manager || 'npm',
      created_at: new Date().toISOString(),
      rapidkit_version: getVersion(),
    };

    // Copy and render template files
    await copyAndRenderTemplate(templatesPath, projectPath, context);

    // Create .gitignore
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

    spinner.succeed(`${templateName} project created!`);

    // Git initialization
    if (!options.skipGit) {
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

    // Install dependencies
    if (!options.skipInstall) {
      if (!isFastAPI) {
        const pm = options.package_manager || 'npm';
        const installSpinner = ora(`Installing dependencies with ${pm}...`).start();
        try {
          await execa(pm, ['install'], { cwd: projectPath });
          installSpinner.succeed('Dependencies installed');
        } catch {
          installSpinner.warn(`Could not install dependencies. Run '${pm} install' manually.`);
        }
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
  ${chalk.cyan('npx rapidkit init')}          ${chalk.gray('# Install dependencies')}
  ${chalk.cyan('npx rapidkit dev')}           ${chalk.gray('# Start dev server')}

${chalk.bold('📚 Available commands:')}
  npx rapidkit init    # Install dependencies (poetry install)
  npx rapidkit dev     # Start dev server with hot reload
  npx rapidkit start   # Start production server
  npx rapidkit test    # Run tests
  npx rapidkit lint    # Lint code
  npx rapidkit format  # Format code

${chalk.gray('Alternative: make dev, ./rapidkit dev, poetry run dev')}
${chalk.gray('💡 Tip: Install globally (npm i -g rapidkit) to use without npx')}
`);
    } else {
      console.log(`
${chalk.green('✨ NestJS project created successfully!')}

${chalk.bold('📂 Project structure:')}
${projectPath}/
  ├── .rapidkit/           # RapidKit CLI module
  ├── src/
  │   ├── main.ts          # Application entry point
  │   ├── app.module.ts    # Root module
  │   ├── config/          # Configuration
  │   └── examples/        # Example module
  ├── test/                # Test files
  ├── package.json         # Dependencies
  └── README.md

${chalk.bold('🚀 Get started:')}
  ${chalk.cyan(`cd ${projectName}`)}
  ${options.skipInstall ? chalk.cyan('npx rapidkit init') + chalk.gray('         # npm install') + '\n  ' : ''}${chalk.cyan('cp .env.example .env')}
  ${chalk.cyan('npx rapidkit dev')}           ${chalk.gray('# Start dev server')}

${chalk.bold('📚 Available commands:')}
  npx rapidkit init    # Install dependencies
  npx rapidkit dev     # Start dev server with hot reload
  npx rapidkit start   # Start production server
  npx rapidkit build   # Build for production
  npx rapidkit test    # Run tests
  npx rapidkit lint    # Lint code
  npx rapidkit format  # Format code

${chalk.bold('🌐 API endpoints:')}
  http://localhost:8000/health          # Health check
  http://localhost:8000/docs            # Swagger docs
  http://localhost:8000/examples/notes  # Example API

${chalk.gray('💡 Tip: Install globally (npm i -g rapidkit) to use without npx')}
`);
    }
  } catch (error) {
    spinner.fail(`Failed to create ${templateName} project`);
    throw error;
  }
}

async function copyAndRenderTemplate(
  src: string,
  dest: string,
  context: Record<string, string>
): Promise<void> {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destName = entry.name.replace(/\.j2$/, '');
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyAndRenderTemplate(srcPath, destPath, context);
    } else {
      let content = await fs.readFile(srcPath, 'utf-8');

      // Render template if it's a .j2 file
      if (entry.name.endsWith('.j2')) {
        content = renderTemplate(content, context);
      }

      await fs.writeFile(destPath, content);

      // Make scripts executable
      if (
        destName === 'rapidkit' ||
        destName === 'activate' ||
        (destName.endsWith('.py') && destPath.includes('.rapidkit'))
      ) {
        await fs.chmod(destPath, 0o755);
      }
    }
  }
}

function renderTemplate(content: string, context: Record<string, string>): string {
  let result = content;

  for (const [key, value] of Object.entries(context)) {
    // Simple variable replacement: {{ key }}
    const simpleRegex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(simpleRegex, String(value));

    // With replace filter: {{ key | replace('a', 'b') }}
    const replaceRegex = new RegExp(
      `\\{\\{\\s*${key}\\s*\\|\\s*replace\\s*\\(\\s*['"]([^'"]+)['"]\\s*,\\s*['"]([^'"]*)['"]\\s*\\)\\s*\\}\\}`,
      'g'
    );
    result = result.replace(replaceRegex, (_match: string, from: string, to: string) => {
      return String(value).replace(new RegExp(from, 'g'), to);
    });

    // With lower filter: {{ key | lower }}
    const lowerRegex = new RegExp(`\\{\\{\\s*${key}\\s*\\|\\s*lower\\s*\\}\\}`, 'g');
    result = result.replace(lowerRegex, String(value).toLowerCase());

    // Combined: {{ key | replace('a', 'b') | lower }}
    const combinedRegex = new RegExp(
      `\\{\\{\\s*${key}\\s*\\|\\s*replace\\s*\\(\\s*['"]([^'"]+)['"]\\s*,\\s*['"]([^'"]*)['"]\\s*\\)\\s*\\|\\s*lower\\s*\\}\\}`,
      'g'
    );
    result = result.replace(combinedRegex, (_match: string, from: string, to: string) => {
      return String(value).replace(new RegExp(from, 'g'), to).toLowerCase();
    });
  }

  return result;
}
