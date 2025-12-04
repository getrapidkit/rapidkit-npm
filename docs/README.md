# Documentation

## 📚 Available Documentation

### Getting Started
- **[../README.md](../README.md)** - Main project documentation, installation, and quick start
- **[../CHANGELOG.md](../CHANGELOG.md)** - Version history and changes

### Development
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide, configuration, testing, and debugging
- **[SETUP.md](./SETUP.md)** - Quick setup guide with all commands and workflow

### Optimization
- **[OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)** - Comprehensive optimization suggestions and best practices

### Utilities
- **[UTILITIES.md](./UTILITIES.md)** - Cache system and performance monitoring utilities documentation

## 🎯 Quick Links

### For Users
1. Start with [README.md](../README.md) for installation and basic usage
2. Check [CHANGELOG.md](../CHANGELOG.md) for latest features

### For Developers
1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for development setup
2. Use [SETUP.md](./SETUP.md) as command reference
3. Review [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md) for improvements
4. Check [UTILITIES.md](./UTILITIES.md) for using cache and performance tools

## 📖 Documentation Structure

```
rapidkit-npm/
├── README.md                    # Main documentation
├── CHANGELOG.md                 # Version history
└── docs/
    ├── README.md               # This file
    ├── DEVELOPMENT.md          # Development guide
    ├── SETUP.md                # Setup and commands
    ├── OPTIMIZATION_GUIDE.md   # Optimization suggestions
    └── UTILITIES.md            # Cache and performance utilities
```

## 🚀 Quick Start

### Create a Project

```bash
# FastAPI project
npx rapidkit my-api --template fastapi

# NestJS project
npx rapidkit my-api --template nestjs

# Workspace (for multiple projects)
npx rapidkit my-workspace
```

### Use Project CLI

```bash
cd my-api
rapidkit init      # Install dependencies
rapidkit dev       # Start dev server (port 8000)
rapidkit test      # Run tests
rapidkit --help    # Show all commands
```
