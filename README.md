# create-rapidkit

> ⚠️ **BETA VERSION** - This is a companion tool for RapidKit Python framework.  
> The stable production version of RapidKit will be released soon on PyPI.  
> Until then, use `--demo` mode for standalone FastAPI demos, or `--test-mode` to try the full RapidKit installation locally.

🚀 The easiest way to get started with RapidKit! This CLI tool offers two modes:
1. **Demo Mode** (`--demo`) - Generate a standalone FastAPI project instantly (no Python setup needed)
2. **Full Mode** - Set up a Python environment with RapidKit installed (requires RapidKit on PyPI - coming soon!)

## Quick Start

### 🎨 Demo Mode (Available Now!)

Get a working FastAPI project in seconds - **no waiting for RapidKit release**:

```bash
npx create-rapidkit my-project --demo
cd my-project
poetry install
poetry run dev
```

**Perfect for:**
- Quick prototyping and demos
- Learning FastAPI and RapidKit project structure
- Testing the kit layout before stable release
- No Python RapidKit dependency required
- **Try now while waiting for stable RapidKit release!**

### 🚀 Full Mode (Coming Soon with Stable Release)

Once RapidKit is published on PyPI, install for full features and modules:

```bash
npx create-rapidkit my-workspace
```

**Note:** Full mode requires RapidKit Python package on PyPI.  
For now, use `--test-mode` flag if you have local RapidKit installation, or use `--demo` for standalone projects.

## Installation Methods

### 🎯 Poetry (Recommended)
```bash
npx rapidkit my-workspace
# Choose: Poetry
cd my-workspace
poetry install
rapidkit create my-project
```

### 📦 Python venv + pip
```bash
npx rapidkit my-workspace
# Select "venv + pip" when prompted

### 🔧 pipx (Global)
```bash
npx rapidkit my-workspace
# Select "pipx (global install)" when prompted

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
npx create-rapidkit [directory-name] [options]
```

### Arguments
- `directory-name` - Name of directory to create (default: `rapidkit`)

### Options
- `--demo` - **[Available Now]** Generate standalone FastAPI demo project instantly (no RapidKit Python required)
- `--skip-git` - Skip git initialization  
- `--test-mode` - **[Beta Testing]** Install from local RapidKit path (for development/testing only)
- `--help` - Display help information
- `--version` - Show version number

> **Note:** Full installation mode (without `--demo`) will be available once RapidKit is published on PyPI.

## Examples

### Demo Project (No Python setup)
```bash
npx create-rapidkit my-demo --demo
```

### Full RapidKit Installation
```bash
npx create-rapidkit my-workspace
```

### Default workspace
```bash
npx create-rapidkit
# Creates ./rapidkit/ directory
```

### Custom directory name
```bash
npx create-rapidkit my-rapidkit-workspace
```

### Skip git initialization
```bash
npx rapidkit --skip-git
```

## Requirements

- **Node.js**: 18+ (for running npx)
- **Python**: 3.10+ (required by RapidKit)
- **Optional**: Poetry or pipx (depending on installation method)

## Typical Workflow

1. **Install RapidKit environment**:
   ```bash
   npx rapidkit
   cd rapidkit
   ```

2. **Activate environment**:
   ```bash
   poetry shell  # or: source .venv/bin/activate
   ```

3. **Create your first project**:
   ```bash
   # Interactive mode (recommended)
   rapidkit create
   
   # Or specify directly:
   rapidkit create project fastapi.standard my-api
   ```

4. **Choose a kit** (e.g., fastapi.standard)

5. **Navigate and run**:
   ```bash
   cd my-api
   uvicorn src.main:app --reload
   ```

## Project Structure

After using `rapidkit create`, your workspace will look like:

```
my-workspace/
├── .venv/              # Virtual environment (venv method)
├── pyproject.toml      # Poetry config (poetry method)
├── README.md           # Usage instructions
├── .gitignore
└── my-project/         # Projects created with rapidkit create
    ├── src/
    ├── tests/
    └── ...
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
- Demo mode with FastAPI standard kit
- Standalone project generation
- Interactive CLI experience

### 🚧 Coming Soon
- **RapidKit Python package on PyPI** (main blocker)
- Full installation mode with all kits
- Module ecosystem integration
- NestJS standard kit demos
- Advanced kit templates

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

**create-rapidkit** is currently in beta. The `--demo` mode is fully functional and production-ready for generating standalone FastAPI projects. Full RapidKit integration will be available once the Python package is published on PyPI.

**Timeline**: RapidKit stable release expected soon. Follow [@getrapidkit](https://github.com/getrapidkit) for updates!
