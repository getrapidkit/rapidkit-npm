# rapidkit

> ⚠️ **BETA VERSION** - This is a companion tool for RapidKit Python framework.  
> The stable production version of RapidKit will be released soon on PyPI.  
> Until then, use `--demo` mode to create demo workspaces with bundled templates, or `--test-mode` to try the full RapidKit installation locally.

🚀 The easiest way to get started with RapidKit! This CLI tool creates development workspaces with two modes:

1. **Demo Mode** (`--demo`) - Create a workspace with bundled FastAPI templates (no Python RapidKit required)
2. **Full Mode** - Set up a Python environment with RapidKit installed (requires RapidKit on PyPI - coming soon!)

## Quick Start

### 🎨 Demo Mode (Available Now!)

Create a demo workspace and generate multiple FastAPI projects instantly:

```bash
# Create demo workspace
npx rapidkit my-workspace --demo
cd my-workspace

# Generate your first project
node generate-demo.js api-project
cd api-project
poetry install
poetry run dev

# Go back and create more projects
cd ..
node generate-demo.js auth-service
node generate-demo.js data-service
```

**Perfect for:**
- Quick prototyping and demos
- Learning FastAPI and RapidKit project structure
- Testing multiple microservices in one workspace
- No Python RapidKit dependency required
- **Try now while waiting for stable RapidKit release!**

### 🚀 Full Mode (Coming Soon with Stable Release)

Once RapidKit is published on PyPI, install for full features and modules:

```bash
npx rapidkit my-workspace
cd my-workspace
source $(poetry env info --path)/bin/activate
rapidkit create my-project
```

**Note:** Full mode requires RapidKit Python package on PyPI.  
For now, use `--test-mode` flag if you have local RapidKit installation, or use `--demo` for workspace with bundled templates.

## Understanding Workspaces

**create-rapidkit** follows a workspace-based architecture:

- **Workspace** = Container directory with development environment
- **Projects** = Individual FastAPI/NestJS applications inside workspace

### Demo Workspace Structure
```
my-workspace/              # Workspace (container)
├── generate-demo.js       # Project generator script
├── package.json          # npm configuration
├── README.md             # Workspace instructions
├── api-project/          # Project 1
│   ├── src/
│   ├── tests/
│   └── pyproject.toml
├── auth-service/         # Project 2
│   ├── src/
│   ├── tests/
│   └── pyproject.toml
└── data-service/         # Project 3
    ├── src/
    ├── tests/
    └── pyproject.toml
```

### Full Workspace Structure
```
my-workspace/              # Workspace (container)
├── .venv/                 # Virtual environment
├── pyproject.toml        # Poetry config
├── README.md             # Workspace instructions
├── api-project/          # Project 1
├── auth-service/         # Project 2
└── data-service/         # Project 3
```

**Benefits:**
- Multiple projects share same environment
- Easy microservices development
- Organized monorepo structure
- Isolated from system Python

## Installation Methods

### 🎯 Poetry (Recommended)
```bash
npx rapidkit my-workspace
# Choose: Poetry
cd my-workspace
source $(poetry env info --path)/bin/activate
rapidkit create my-project
```

### 📦 Python venv + pip
```bash
npx rapidkit my-workspace
# Select "venv + pip" when prompted
cd my-workspace
source .venv/bin/activate
rapidkit create my-project
```

### 🔧 pipx (Global)
```bash
npx rapidkit my-workspace
# Select "pipx (global install)" when prompted
cd my-workspace
rapidkit create my-project
```

## What Gets Installed?

`rapidkit` creates a directory with:
- Python virtual environment (Poetry or venv)
- RapidKit package installed
- README with usage instructions
- Git repository (optional)

## Using RapidKit Commands

Once your environment is activated, you can use all native RapidKit commands:

```bash
# Create a new project (interactive)
rapidkit create

# Or create non-interactively:
rapidkit create project fastapi.standard my-api

# Add modules to existing project
cd my-api
rapidkit add settings
rapidkit add auth
rapidkit add database
rapidkit add caching

# List available kits and modules
rapidkit list
rapidkit modules

# Check system requirements
rapidkit doctor

# Upgrade RapidKit
rapidkit upgrade

# Get help
rapidkit --help
```

## Available Kits

RapidKit supports multiple project templates:
- `fastapi.standard` - FastAPI with basic features
- `fastapi.advanced` - FastAPI with advanced features
- `nestjs.standard` - NestJS with basic features
- `nestjs.advanced` - NestJS with advanced features

## CLI Options

```bash
npx rapidkit [workspace-name] [options]
```

### Arguments
- `workspace-name` - Name of workspace directory to create (default: `rapidkit-workspace`)

### Options
- `--demo` - **[Available Now]** Create workspace with bundled FastAPI templates (no Python RapidKit required)
- `--demo-only` - **[Internal]** Generate a single project in current directory (used by demo workspace script)
- `--skip-git` - Skip git initialization  
- `--test-mode` - **[Beta Testing]** Install from local RapidKit path (for development/testing only)
- `--help` - Display help information
- `--version` - Show version number

> **Note:** Full installation mode (without `--demo`) will be available once RapidKit is published on PyPI.

## Examples

### Demo Workspace
```bash
# Create demo workspace
npx rapidkit my-workspace --demo
cd my-workspace

# Generate projects inside
node generate-demo.js api-service
node generate-demo.js auth-service
```

### Full RapidKit Workspace
```bash
# Create workspace with RapidKit installed
npx rapidkit my-workspace
cd my-workspace

# Create projects using RapidKit CLI
rapidkit create api-service
rapidkit create auth-service
```

### Default workspace
```bash
npx rapidkit --demo
# Creates ./rapidkit-workspace/ directory
```

### Skip git initialization
```bash
npx rapidkit my-workspace --demo --skip-git
```

## Requirements

- **Node.js**: 18+ (for running npx)
- **Python**: 3.10+ (required by RapidKit)
- **Optional**: Poetry or pipx (depending on installation method)

## Typical Workflow

### Demo Mode
1. **Create demo workspace**:
   ```bash
   npx rapidkit my-workspace --demo
   cd my-workspace
   ```

2. **Generate your first project**:
   ```bash
   node generate-demo.js api-service
   cd api-service
   ```

3. **Install dependencies and run**:
   ```bash
   poetry install
   poetry run dev
   ```

4. **Create more projects** (go back to workspace):
   ```bash
   cd ..
   node generate-demo.js auth-service
   node generate-demo.js data-service
   ```

### Full Mode (After RapidKit PyPI Release)
1. **Create RapidKit workspace**:
   ```bash
   npx rapidkit my-workspace
   cd my-workspace
   ```

2. **Activate environment**:
   ```bash
   source $(poetry env info --path)/bin/activate
   # Or: poetry shell
   ```

3. **Create your first project**:
   ```bash
   # Interactive mode (recommended)
   rapidkit create
   
   # Or specify directly:
   rapidkit create project fastapi.standard api-service
   ```

4. **Navigate and run**:
   ```bash
   cd api-service
   rapidkit run dev
   ```

5. **Create more projects** (from workspace root):
   ```bash
   cd ..
   rapidkit create project fastapi.standard auth-service
   rapidkit create project nestjs.standard data-service
   ```

## Troubleshooting

### Python not found
```bash
# Check Python version
python3 --version

# Install Python 3.10+
# Visit: https://www.python.org/downloads/
```

### Poetry not found
```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Or visit: https://python-poetry.org/docs/#installation
```

### pipx not found
```bash
# Install pipx
python3 -m pip install --user pipx
python3 -m pipx ensurepath

# Or visit: https://pypa.github.io/pipx/installation/
```

### Check RapidKit installation
```bash
# Activate environment first
poetry shell  # or: source .venv/bin/activate

# Verify RapidKit
rapidkit --version
rapidkit doctor
```

## What's Next?

After setting up your RapidKit environment:

## What's Next?

After setting up your demo project:

1. Explore the generated FastAPI structure
2. Customize routes and add your business logic
3. **Stay tuned for RapidKit stable release on PyPI**
4. Upgrade to full RapidKit for modules and advanced features

## Roadmap

### ✅ Current (Beta)
- ✅ Demo workspace with bundled FastAPI templates
- ✅ Multiple projects per workspace
- ✅ Interactive project generation
- ✅ Full FastAPI project structure

### 🚧 Coming Soon
- **RapidKit Python package on PyPI** (main blocker)
- Full installation mode with all kits
- Module ecosystem integration (`rapidkit add module`)
- NestJS standard kit demos
- Advanced kit templates
- Workspace sharing and templates

### 🔮 Future
- More framework support
- Custom kit marketplace
- Cloud deployment integrations
- CI/CD templates

## Related Projects

- **RapidKit Python** - The core framework (coming soon to PyPI)
- **RapidKit Marketplace** - Browse and share modules (https://rapidkit.dev)
- **GitHub**: https://github.com/getrapidkit

## Contributing

Contributions welcome! This NPM package is a companion tool for RapidKit.

To contribute:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT

## Support

- 🐛 Report issues: [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues)
- 📚 Docs: https://rapidkit.dev
- 💬 Community: Coming soon

---

### About This Beta

**rapidkit** (npm package) is currently in beta version 1.0.0-beta.4. The `--demo` mode is fully functional for creating workspaces with bundled FastAPI templates. You can generate multiple projects within the same workspace without needing Python RapidKit installed.

Install with:
```bash
npx rapidkit my-workspace --demo
```

**Full RapidKit integration** (with `rapidkit create` and `rapidkit add module` commands) will be available once the Python package is published on PyPI.

**Timeline**: RapidKit stable release expected soon. Follow [@getrapidkit](https://github.com/getrapidkit) for updates!
