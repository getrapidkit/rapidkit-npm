# RapidKit CLI

[![npm version](https://img.shields.io/npm/v/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![npm downloads](https://img.shields.io/npm/dm/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/getrapidkit/rapidkit-npm.svg?style=flat-square)](https://github.com/getrapidkit/rapidkit-npm/stargazers)

> ⚠️ **PRE-RELEASE VERSION** - This is a companion tool for RapidKit framework.  
> The stable production version of RapidKit Python will be released soon on PyPI.

🚀 The easiest way to create FastAPI and NestJS projects with RapidKit templates!

**🤖 NEW:** [AI-powered module recommendations](#-ai-features) to help you build faster!  
**💡 Tip:** Use the [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) for a visual interface!

## Quick Start

### Create a FastAPI Project

```bash
npx rapidkit my-api --template fastapi
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:8000
```

### Create a NestJS Project

```bash
npx rapidkit my-api --template nestjs
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:8000
```

Your API will be available at `http://localhost:8000` with Swagger docs at `/docs`

## Two Modes of Operation

### 1. Direct Project Creation (with `--template`)

Create a standalone project directly:

```bash
npx rapidkit my-api --template fastapi   # Create FastAPI project
npx rapidkit my-api --template nestjs    # Create NestJS project
```

### 2. Workspace Mode (without `--template`)

Create a workspace to organize multiple projects:

```bash
npx rapidkit my-workspace                     # Create workspace
cd my-workspace
npx rapidkit my-api --template fastapi        # Create FastAPI project
npx rapidkit admin-api --template nestjs      # Create NestJS project
```

> **Note:** The same `npx rapidkit <name> --template <type>` command works everywhere - in any directory or inside a workspace!

## Templates

| Template | Framework | Description |
|----------|-----------|-------------|
| `fastapi` | FastAPI | Python async web framework with automatic API docs |
| `nestjs` | NestJS | TypeScript Node.js framework with modular architecture |

## 🤖 AI Features

RapidKit now includes AI-powered module recommendations using OpenAI embeddings!

### Quick Start with AI

**First time setup** (automatic):
```bash
# Just use AI recommendations - it will guide you through setup!
npx rapidkit ai recommend "user authentication with social login"

# If embeddings don't exist, you'll see:
# ⚠️  Module embeddings not found
# ? What would you like to do?
#   🚀 Generate embeddings now (requires OpenAI API key)
#   📝 Show me how to generate them manually
#   ❌ Cancel
```

**Example Usage:**
```bash
# Get intelligent module recommendations
npx rapidkit ai recommend "I need user authentication with email"

# Output:
# 📦 Recommended Modules:
# 1. Authentication Core
#    Complete authentication with JWT, OAuth 2.0, secure sessions
#    Match: 92.5% - Matches: auth, login, email
#    Category: auth
#
# 2. Users Core
#    User management with profiles, roles, permissions
#    Match: 88.3% - Matches: user
#    Category: auth
#    Requires: authentication-core
```

### AI Commands

```bash
# Get recommendations
npx rapidkit ai recommend "payment processing with Stripe"
npx rapidkit ai recommend "real-time notifications" --number 3

# Setup and management
npx rapidkit config set-api-key              # Configure OpenAI API key
npx rapidkit ai generate-embeddings          # Manual embedding generation
npx rapidkit ai generate-embeddings --force  # Force regeneration
npx rapidkit ai update-embeddings            # Update with latest modules
npx rapidkit ai info                         # Show features & pricing
```

### Features

- 🧠 **Semantic Search**: AI understands intent, not just keywords
- 🤖 **Auto-Setup**: Embeddings generate automatically on first use
- 📦 **27+ Modules**: Production-ready modules from RapidKit Python Core
- 💰 **Ultra-Cheap**: ~$0.0002 per query (practically free)
- 🎯 **Dependency Detection**: Automatically shows required modules
- ✅ **Mock Mode**: Test without API key using deterministic embeddings
- 🔄 **Dynamic Catalog**: Fetches latest modules from Python Core

### Pricing

**One-time Setup:**
- Generate embeddings: ~$0.50 (one time only)

**Per Query:**
- Single query: ~$0.0002
- 100 queries: ~$0.02 (2 cents)
- 1,000 queries: ~$0.20 (20 cents)

💡 **Tip:** Setup cost is paid once, then queries are essentially free!

### Available Module Categories

- 🔐 **Auth**: authentication-core, users-core, session-management, 2fa
- 💾 **Database**: db-postgres, db-mongodb, db-mysql
- 💳 **Payment**: stripe-payment, payment-core
- 📧 **Communication**: email, sms, notifications
- 🚀 **Infrastructure**: redis-cache, celery, storage, rate-limiter
- 📊 **Monitoring**: logging, analytics, error-tracking
- 🔌 **Integrations**: webhooks, api-gateway, graphql

### Troubleshooting

**No OpenAI API Key?**
```bash
# AI works in mock mode without API key (for testing)
npx rapidkit ai recommend "auth"  # Works without key!

# For production, get a key:
# 1. Visit: https://platform.openai.com/api-keys
# 2. Create new key
# 3. Configure: npx rapidkit config set-api-key
```

**Embeddings Not Found?**
```bash
# Just run any AI command - it will prompt you to generate them
npx rapidkit ai recommend "database"

# Or generate manually:
npx rapidkit ai generate-embeddings
```

**Update Embeddings After RapidKit Python Update?**
```bash
npx rapidkit ai update-embeddings
```

**See Current Config:**
```bash
npx rapidkit config show
```

### Learn More

- 📚 **Full Guide**: [docs/AI_FEATURES.md](docs/AI_FEATURES.md)
- 🔧 **Technical Details**: [docs/AI_DYNAMIC_INTEGRATION.md](docs/AI_DYNAMIC_INTEGRATION.md)

## CLI Options

```bash
npx rapidkit [project-name] [options]
```

### Arguments
- `project-name` - Name of project/workspace directory to create

### Options
- `-t, --template <template>` - Template to use: `fastapi` or `nestjs` (creates direct project)
- `--skip-git` - Skip git initialization  
- `--skip-install` - Skip installing dependencies (for NestJS)
- `--debug` - Enable verbose debug logging
- `--dry-run` - Preview what would be created without creating it
- `--no-update-check` - Skip checking for newer versions
- `--help` - Display help information
- `--version` - Show version number

## Project Commands

After creating a project, use these commands:

```bash
cd my-api
npx rapidkit init      # Install dependencies (auto-activates environment)
npx rapidkit dev       # Start dev server with hot reload (port 8000)
npx rapidkit start     # Start production server
npx rapidkit build     # Build for production
npx rapidkit test      # Run tests
npx rapidkit lint      # Lint code
npx rapidkit format    # Format code

# AI Commands (new!)
npx rapidkit ai recommend "query"           # Get module recommendations
npx rapidkit ai recommend "auth" --number 3 # Get top 3 results
npx rapidkit ai generate-embeddings         # Generate embeddings (one-time)
npx rapidkit ai update-embeddings           # Update embeddings
npx rapidkit ai info                        # Show AI features info
npx rapidkit config set-api-key             # Configure OpenAI API key
npx rapidkit config show                    # View current config

npx rapidkit --help    # Show all commands
```

> **Note:** `npx rapidkit` automatically detects when you're inside a RapidKit project and delegates to the local CLI. Works everywhere without any setup!

> **💡 Tip:** Install globally with `npm i -g rapidkit` to use `rapidkit` directly without `npx`.

### Alternative: Direct Commands

You can also run commands directly:

```bash
./rapidkit dev          # Using the wrapper script
make dev                # Using Makefile (FastAPI)
poetry run dev          # Using Poetry directly (FastAPI)
npm run start:dev       # Using npm directly (NestJS)
```

## Project Structure

### FastAPI Project

```
my-api/
├── .rapidkit/
│   ├── activate         # Activation script
│   ├── cli.py           # Python CLI module
│   └── rapidkit         # Bash wrapper
├── rapidkit             # Main CLI entry point
├── src/
│   ├── main.py          # FastAPI application
│   ├── cli.py           # CLI commands
│   ├── routing/         # API routes
│   └── modules/         # Module system
├── tests/               # Test suite
├── pyproject.toml       # Poetry configuration
├── Makefile             # Make commands
└── README.md
```

### NestJS Project

```
my-api/
├── .rapidkit/
│   ├── activate         # Activation script
│   └── rapidkit         # Bash CLI wrapper
├── rapidkit             # Main CLI entry point
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── config/              # Configuration
│   └── examples/            # Example module
├── test/                    # Test files
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md
```

## Requirements

- **Node.js**: 18+ (for running npx)
- **For FastAPI**: Python 3.11+ with Poetry
- **For NestJS**: Node.js 20+ with npm/yarn/pnpm

## Development

```bash
# Clone the repository
git clone https://github.com/getrapidkit/rapidkit-npm.git
cd rapidkit-npm

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## Related Projects

- **RapidKit Python** - The core framework (coming soon to PyPI)
- **RapidKit Docs** - https://getrapidkit.com
- **GitHub**: https://github.com/getrapidkit

## License

MIT

## Support

- 🐛 Report issues: [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues)
- 📚 Docs: https://getrapidkit.com

---

**v0.13.0** - NestJS test coverage boost (75%→90%), demo-kit improvements

**v0.12.4** - Friendly shell activation UX with green headers and robust fallback logic

**v0.12.2** - Simplified CLI: `rapidkit init` now handles environment activation automatically

**v0.12.0** - Added NestJS template, workspace mode, and unified CLI
