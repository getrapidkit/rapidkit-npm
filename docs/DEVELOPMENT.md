# Development Guide

## Configuration

### User Configuration File

Create `~/.rapidkitrc.json` in your home directory to set default values:

```json
{
  "defaultKit": "fastapi.standard",
  "defaultInstallMethod": "poetry",
  "pythonVersion": "3.11",
  "author": "Your Name",
  "license": "MIT",
  "skipGit": false
}
```

### Test Mode

For development and testing with a local RapidKit installation:

```bash
# Set environment variable
export RAPIDKIT_DEV_PATH=/path/to/local/rapidkit

# Or add to ~/.rapidkitrc.json
{
  "testRapidKitPath": "/path/to/local/rapidkit"
}

# Then use --test-mode flag
npx rapidkit my-workspace --test-mode
```

**Priority:** CLI options > Environment variables > Config file > Defaults

## Two Modes of Operation

### 1. Direct Project Creation (with `--template`)

When you specify `--template`, it creates a standalone project:

```bash
npx rapidkit my-api --template fastapi   # Create FastAPI project
npx rapidkit my-api --template nestjs    # Create NestJS project
```

### 2. Workspace Mode (without `--template`)

Without `--template`, it creates a workspace for multiple projects:

```bash
npx rapidkit my-workspace                 # Create workspace
cd my-workspace
rapidkit create my-api --kit fastapi      # Create project in workspace
```

## Project CLI (`.rapidkit/activate`)

Each generated project includes a local CLI system:

```bash
cd my-api
source .rapidkit/activate   # Enable rapidkit commands (once per terminal)

# Now you can use:
rapidkit init      # Install dependencies
rapidkit dev       # Start dev server (port 8000)
rapidkit test      # Run tests
rapidkit --help    # Show all commands
```

### How It Works

1. **`rapidkit`** (root) - Bash script that finds Python and runs `.rapidkit/cli.py`
2. **`.rapidkit/activate`** - Adds project root to PATH for the current terminal
3. **`.rapidkit/cli.py`** - Python CLI with all project commands
4. **`.rapidkit/rapidkit`** - Bash wrapper for poetry/npm commands

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npx vitest --ui
```

### Manual Testing

```bash
# Build the package
npm run build

# Test FastAPI project creation
node dist/index.js test-fastapi --template fastapi

# Test NestJS project creation
node dist/index.js test-nest --template nestjs

# Test workspace creation
node dist/index.js test-workspace

# Test the generated project
cd test-fastapi
source .rapidkit/activate
rapidkit init
rapidkit dev
```

### Test Structure

```
src/__tests__/
├── validation.test.ts    # Project name validation
├── errors.test.ts        # Custom error classes
└── config.test.ts        # Configuration loading
```

## Debugging

Enable debug mode for verbose logging:

```bash
npx rapidkit my-workspace --debug
```

Debug logs include:
- Config loading details
- Environment variable resolution
- Installation paths
- API call traces

## Dry-Run Mode

See what would be created without actually creating it:

```bash
npx rapidkit my-workspace --dry-run
npx rapidkit my-api --template fastapi --dry-run
```

## Building

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run dev
```

## Environment Variables

- `RAPIDKIT_DEV_PATH` - Path to local RapidKit for test mode
- `DEBUG` - Enable debug logging (alternative to --debug flag)
- `NODE_ENV` - Node environment (development/production)

## Error Handling

All errors extend `RapidKitError` base class with:
- `message` - Human-readable error message
- `code` - Machine-readable error code
- `details` - Additional help text (optional)

Example error codes:
- `PYTHON_NOT_FOUND` - Python not installed or wrong version
- `POETRY_NOT_FOUND` - Poetry not installed
- `DIRECTORY_EXISTS` - Target directory already exists
- `INVALID_PROJECT_NAME` - Project name validation failed
- `INSTALLATION_ERROR` - Installation step failed
- `RAPIDKIT_NOT_AVAILABLE` - RapidKit not on PyPI yet

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Release Process

1. Update version in `package.json`
2. Update version in `src/update-checker.ts`
3. Update CHANGELOG.md
4. Build and test: `npm run build && npm test`
5. Commit: `git commit -am "Release v1.0.0"`
6. Tag: `git tag v1.0.0`
7. Push: `git push && git push --tags`
8. Publish: `npm publish`
