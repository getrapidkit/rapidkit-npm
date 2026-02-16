# Documentation

## 📚 Available Documentation

### Getting Started

- **[../README.md](../README.md)** - Main project documentation, installation, and quick start
- **[../CHANGELOG.md](../CHANGELOG.md)** - Version history and changes

### AI Features

- **[AI_QUICKSTART.md](./AI_QUICKSTART.md)** - Quick start guide for AI-powered module recommendations
- **[AI_FEATURES.md](./AI_FEATURES.md)** - Complete AI features documentation
- **[AI_EXAMPLES.md](./AI_EXAMPLES.md)** - Real-world AI usage examples
- **[AI_DYNAMIC_INTEGRATION.md](./AI_DYNAMIC_INTEGRATION.md)** - Advanced AI integration patterns

### Development

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide, configuration, testing, and debugging
- **[SETUP.md](./SETUP.md)** - Quick setup guide with all commands and workflow

### Configuration & Commands

- **[config-file-guide.md](./config-file-guide.md)** - Configuration file reference
- **[doctor-command.md](./doctor-command.md)** - Doctor command documentation
- **[WORKSPACE_MARKER_SPEC.md](./WORKSPACE_MARKER_SPEC.md)** - Workspace marker specification

### Optimization & Utilities

- **[OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)** - Comprehensive optimization suggestions and best practices
- **[UTILITIES.md](./UTILITIES.md)** - Cache system and performance monitoring utilities documentation

### Security

- **[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting

## 🎯 Quick Links

### For Users

1. Start with [README.md](../README.md) for installation and basic usage
2. Try [AI_QUICKSTART.md](./AI_QUICKSTART.md) for AI-powered module recommendations
3. Check [CHANGELOG.md](../CHANGELOG.md) for latest features

### For Developers

1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for development setup
2. Use [SETUP.md](./SETUP.md) as command reference
3. Review [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md) for improvements
4. Check [UTILITIES.md](./UTILITIES.md) for using cache and performance tools
5. See [config-file-guide.md](./config-file-guide.md) for configuration options

## 📖 Documentation Structure

```
rapidkit-npm/
├── README.md                           # Main documentation
├── CHANGELOG.md                        # Version history
└── docs/
    ├── README.md                       # This file
    ├── AI_QUICKSTART.md                # AI quick start
    ├── AI_FEATURES.md                  # AI features documentation
    ├── AI_EXAMPLES.md                  # AI usage examples
    ├── AI_DYNAMIC_INTEGRATION.md       # Advanced AI integration
    ├── DEVELOPMENT.md                  # Development guide
    ├── SETUP.md                        # Setup and commands
    ├── OPTIMIZATION_GUIDE.md           # Optimization suggestions
    ├── UTILITIES.md                    # Cache and performance utilities
    ├── SECURITY.md                     # Security policy
    ├── config-file-guide.md            # Configuration reference
    ├── doctor-command.md               # Doctor command docs
    ├── WORKSPACE_MARKER_SPEC.md        # Workspace marker spec
    └── contracts/                      # Technical specifications
```

## 🚀 Quick Start

### Create a Project

```bash
# Canonical (recommended)
npx rapidkit create project fastapi.standard my-api
npx rapidkit create project nestjs.standard my-api

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
