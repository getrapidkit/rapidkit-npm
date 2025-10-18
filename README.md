# create-rapidkit

CLI tool to create RapidKit projects with a single command.

## Usage

```bash
npx create-rapidkit my-app
```

or

```bash
npm create rapidkit my-app
```

## Features

- 🚀 **Interactive Setup** - Guided prompts for framework, modules, and configuration
- 🐍 **FastAPI Support** - Both standard and advanced templates
- 🟢 **NestJS Support** - Both standard and advanced templates
- 📦 **Module System** - Choose from 8+ pre-built modules
- 🐳 **Docker Ready** - Optional Docker and docker-compose configuration
- 🧪 **Testing Setup** - Pre-configured testing environment
- ⚙️ **CI/CD** - GitHub Actions workflow included
- 🎨 **Smart Detection** - Auto-detects package manager (npm/yarn/pnpm)

## Available Modules

- Authentication & JWT
- Database ORM (Professional)
- Caching (Redis)
- File Upload & Storage
- Email Service
- Logging & Monitoring
- Rate Limiting
- WebSocket Support

## Command Line Options

```bash
npx create-rapidkit [project-name] [options]
```

### Options:

- `-f, --framework <framework>` - Framework to use (fastapi-standard, fastapi-advanced, nestjs-standard, nestjs-advanced)
- `-m, --modules <modules...>` - Modules to include
- `--skip-install` - Skip dependency installation
- `--skip-git` - Skip git initialization
- `-v, --version` - Output the current version

## Examples

### Interactive mode (recommended):
```bash
npx create-rapidkit
```

### With options:
```bash
npx create-rapidkit my-app --framework fastapi-standard --modules auth database-orm-pro
```

### Skip installation:
```bash
npx create-rapidkit my-app --skip-install
```

## What gets generated?

### For FastAPI projects:
- Project structure with `src/` directory
- Main application file with FastAPI setup
- Configuration management
- Database connection setup
- API routes structure
- Selected modules implementation
- Poetry or pip configuration
- Docker configuration (optional)
- Testing setup with pytest (optional)
- GitHub Actions CI/CD (optional)

### For NestJS projects:
- NestJS project structure
- Main application module
- Controllers and services
- Configuration setup
- Selected modules implementation
- npm/yarn/pnpm support
- Docker configuration (optional)
- Testing setup with Jest (optional)
- GitHub Actions CI/CD (optional)

## Requirements

- Node.js >= 18.0.0
- Python >= 3.10 (for FastAPI projects)
- Git (for git initialization)
- Poetry or pip (for FastAPI projects)
- npm/yarn/pnpm (for NestJS projects)

## Development

```bash
# Clone the repository
git clone https://github.com/getrapidkit/create-rapidkit.git
cd create-rapidkit

# Install dependencies
npm install

# Build
npm run build

# Link for local testing
npm link

# Test locally
create-rapidkit test-app
```

## License

MIT

## Links

- [RapidKit Website](https://rapidkit.dev)
- [Documentation](https://rapidkit.dev/docs)
- [GitHub](https://github.com/getrapidkit/rapidkit)
- [Community](https://github.com/getrapidkit/rapidkit/discussions)
