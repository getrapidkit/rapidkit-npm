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
npx create-rapidkit my-workspace --test-mode
```

**Priority:** CLI options > Environment variables > Config file > Defaults

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
npx create-rapidkit my-workspace --debug
```

Debug logs include:
- Config loading details
- Environment variable resolution
- Installation paths
- API call traces

## Dry-Run Mode

See what would be created without actually creating it:

```bash
npx create-rapidkit my-workspace --dry-run
npx create-rapidkit my-workspace --demo --dry-run
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
