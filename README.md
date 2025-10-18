# rapidkit

🚀 The easiest way to get started with RapidKit! This CLI tool sets up a Python environment with RapidKit installed, so you can immediately start creating projects using native RapidKit commands.

## What is rapidkit?

`rapidkit` is an **npx-based installer** that creates a development workspace with RapidKit (Python package) pre-installed in a virtual environment. Think of it as a beginner-friendly onboarding tool that handles the Python setup for you.

**After installation, you use the native `rapidkit` commands** to create and manage your FastAPI/NestJS projects.

## Why use rapidkit?

Installing Python packages can be challenging for beginners. This tool:
- ✅ Handles Python virtual environment creation
- ✅ Installs RapidKit automatically
- ✅ Supports Poetry, venv, or pipx
- ✅ Works via familiar `npx` command
- ✅ No manual Python environment setup needed

## Quick Start

```bash
npx rapidkit my-workspace
```

That's it! Follow the prompts to choose your installation method.

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
npx rapidkit [directory-name] [options]
```

### Arguments
- `directory-name` - Name of directory to create (default: `rapidkit`)

### Options
- `--skip-git` - Skip git initialization
- `--help` - Display help information
- `--version` - Show version number

## Examples

### Default workspace
```bash
npx rapidkit
# Creates ./rapidkit/ directory
```

### Custom directory name
```bash
npx rapidkit my-rapidkit-workspace
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

1. Explore RapidKit documentation
2. Create projects with different kits
3. Add modules to customize your projects
4. Build your API and deploy

## Related Projects

- **RapidKit** - The core Python package for project generation
- **RapidKit Marketplace** - Browse and share RapidKit modules

## Contributing

Contributions are welcome! This is a thin wrapper around the RapidKit Python package.

To contribute:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT

## Support

- 🐛 Report issues: GitHub Issues
- 📚 RapidKit docs: [RapidKit Documentation](https://rapidkit.dev)
- 💬 Community: RapidKit Discord/Slack

---

**Note**: `rapidkit` is an **installer tool**. The actual project generation is done by the **RapidKit Python package** using native commands like `rapidkit create`.
