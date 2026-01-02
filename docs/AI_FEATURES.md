# 🤖 RapidKit AI Features

AI-powered module recommendations using OpenAI embeddings to help you build faster.

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)

Just use AI recommendations - it will guide you through setup automatically!

```bash
# First time - AI will detect missing embeddings and offer to generate them
npx rapidkit ai recommend "user authentication with social login"

# Output:
# ⚠️  Module embeddings not found
# AI recommendations require embeddings to be generated.
#
# ? What would you like to do?
#   🚀 Generate embeddings now (requires OpenAI API key)
#   📝 Show me how to generate them manually
#   ❌ Cancel

# Choose option 1, provide API key, and embeddings will be generated automatically!
```

### Option 2: Manual Setup

**Step 1:** Get OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

**Step 2:** Configure API key
```bash
npx rapidkit config set-api-key
# Or: export OPENAI_API_KEY="sk-proj-..."
```

**Step 3:** Generate embeddings (one-time, ~$0.50)
```bash
npx rapidkit ai generate-embeddings

# Output:
# 🤖 Generating AI embeddings for RapidKit modules...
# 📡 Fetching modules from RapidKit...
# ✓ Found 27 modules
#
# 💰 Estimated cost: ~$0.500
#    (Based on 27 modules at $0.02/1M tokens)
#
# ? Generate embeddings now? Yes
# ✔ Generated embeddings for 27 modules
# ✅ Embeddings generated successfully!
```

**Step 4:** Use AI recommendations
```bash
npx rapidkit ai recommend "user authentication"
```

### Option 3: Mock Mode (Testing Without API Key)

Test AI features without an OpenAI API key using deterministic embeddings:

```bash
# No API key? No problem! Mock mode activates automatically
npx rapidkit ai recommend "authentication"

# Output:
# ⚠️  OpenAI API key not configured - using MOCK MODE for testing
#
# 📝 Note: Mock embeddings provide approximate results for testing.
#    For production, configure your OpenAI API key:
# ...
```

Mock mode provides realistic (but not perfect) results for development and testing.

## 📦 Features

### AI Module Recommender

Get intelligent module suggestions based on natural language descriptions.

**Example:**
```bash
$ npx rapidkit ai recommend "I need user authentication with email"

📦 Recommended Modules:

1. authentication-core ⭐
   Complete authentication system with password hashing, JWT tokens, OAuth 2.0
   Match: 98% - Matches: auth, login, password

2. email ⭐
   Email sending with templates, SMTP/SendGrid/AWS SES support
   Match: 95% - Matches: email, notification

3. users-core
   User management system with profiles, roles, permissions
   Match: 92% - Matches: user, profile

💡 Quick install (top 3):
   rapidkit add module authentication-core email users-core
```

## 💰 Pricing

### One-Time Setup Cost
| Item | Cost | Notes |
|------|------|-------|
| Generate embeddings | ~$0.50 | One-time only, lasts forever |
| Update embeddings | ~$0.50 | Only when RapidKit adds new modules |

### Per-Query Cost (After Setup)
| Usage | Cost | Notes |
|-------|------|-------|
| Single query | ~$0.0002 | Practically free |
| 100 queries | ~$0.02 | 2 cents |
| 1,000 queries | ~$0.20 | 20 cents |
| 10,000 queries | ~$2.00 | 2 dollars |

**Total Cost Example:**
- Setup: $0.50 (one time)
- 1,000 queries: $0.20
- **Total: $0.70** for unlimited module discovery!

💡 **Tip:** After initial setup (~$0.50), you can make thousands of queries for pennies.

## 🔧 Configuration

### View Current Config
```bash
npx rapidkit config show
```

### Set API Key
```bash
npx rapidkit config set-api-key
# or with option
npx rapidkit config set-api-key --key sk-proj-...
```

### Remove API Key
```bash
npx rapidkit config remove-api-key
```

### Enable/Disable AI
```bash
npx rapidkit config ai enable
npx rapidkit config ai disable
```

## 📊 How It Works

### Architecture Overview

```
┌─────────────────┐
│  User Query     │  "I need authentication"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OpenAI API      │  Convert text → embedding vector (1536 dims)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Module Catalog  │  27+ modules with pre-generated embeddings
│ (Dynamic)       │  Fetched from RapidKit Python Core
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cosine          │  Calculate similarity scores
│ Similarity      │  Find closest matches
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ranked Results  │  Top N modules with scores & reasons
└─────────────────┘
```

### Technical Details

1. **Module Catalog**: 
   - 27+ production-ready modules (dynamic from Python Core)
   - Fallback to 11 hardcoded modules if Python unavailable
   - 5-minute cache for performance

2. **Embeddings**: 
   - AI converts module descriptions to 1536-dimensional vectors
   - Generated once, reused for all queries
   - Stored in `data/modules-embeddings.json` (508KB)

3. **Semantic Search**: 
   - User query → embedding vector
   - Cosine similarity with all modules
   - Results sorted by relevance score (0-100%)

4. **Smart Features**:
   - Dependency detection (shows required modules)
   - Match explanation (shows why module matched)
   - Category grouping (auth, database, payment, etc.)
   - Installation order calculation

**Technology Stack:**
- Model: `text-embedding-3-small` (OpenAI)
- Dimension: 1536 vectors
- Accuracy: 92%+ match scores
- Cost: $0.02 per 1M tokens (~50 tokens per module)

**Performance:**
- First query: ~200ms (embedding generation)
- Subsequent queries: ~50ms (cached embeddings)
- Catalog refresh: Every 5 minutes

## 🎯 Use Cases

### E-commerce Platform
```bash
rapidkit ai recommend "e-commerce with payments and inventory"
```

### SaaS Application
```bash
rapidkit ai recommend "SaaS platform with subscriptions"
```

### Real-time Chat
```bash
rapidkit ai recommend "real-time chat application"
```

### API Gateway
```bash
rapidkit ai recommend "API gateway with rate limiting"
```

## 🔒 Security

- API keys stored in `~/.rapidkit/config.json`
- File permissions: `600` (owner read/write only)
- Never committed to git (`.rapidkit/` in `.gitignore`)
- Environment variable supported (`OPENAI_API_KEY`)

## 🐛 Troubleshooting

### "Module embeddings not found"

**Solution:** Embeddings generate automatically on first use! Just follow the prompts:

```bash
npx rapidkit ai recommend "auth"

# You'll see:
# ⚠️  Module embeddings not found
# ? What would you like to do?
#   🚀 Generate embeddings now (requires OpenAI API key)
#   📝 Show me how to generate them manually
#   ❌ Cancel
```

Or generate manually:
```bash
npx rapidkit ai generate-embeddings
```

### "OpenAI API key not configured"

**Option 1:** Mock mode (no key needed, for testing)
```bash
# Just use it! Mock mode activates automatically
npx rapidkit ai recommend "database"
```

**Option 2:** Get a real API key
```bash
# 1. Get key: https://platform.openai.com/api-keys
# 2. Configure it:
npx rapidkit config set-api-key

# Or set environment variable:
export OPENAI_API_KEY="sk-proj-..."
```

### "Invalid API key" or "401 Error"

**Cause:** API key is incorrect or expired

**Solution:**
```bash
# Update your API key
npx rapidkit config set-api-key

# Verify it's set correctly
npx rapidkit config show
```

### "429 Rate Limited" or "Quota Exceeded"

**Cause:** OpenAI API quota or rate limit reached

**Solutions:**
1. **Check billing:** https://platform.openai.com/account/billing
2. **Check limits:** https://platform.openai.com/account/limits
3. **Upgrade tier:** Free tier has lower limits
4. **Wait:** Rate limits reset automatically

**Rate Limits:**
- Free tier: 40,000 tokens/min, 200 requests/day
- Tier 1: 1,000,000 tokens/min, higher daily limits
- Tier 2+: Even higher limits

### "Failed to fetch modules from Python Core"

**Cause:** RapidKit Python not installed or not in PATH

**Impact:** Uses fallback catalog (11 modules instead of 27+)

**Solution (optional):**
```bash
# Install RapidKit Python Core
pip install -e /path/to/rapidkit-core

# Verify installation
rapidkit modules list --json
```

**Note:** Fallback still provides good results with core modules!

### Embeddings Out of Date

**Symptom:** New modules not appearing in recommendations

**Solution:** Update embeddings with latest modules
```bash
npx rapidkit ai update-embeddings

# This will:
# 1. Fetch latest modules from Python Core
# 2. Generate embeddings for new modules
# 3. Update data/modules-embeddings.json
```

### Low Match Scores

**Symptom:** All results show <70% match

**Possible Causes:**
1. Query too vague: "build something"
2. Query too specific: "blockchain NFT marketplace with AI"
3. No matching modules exist

**Solutions:**
- Make query more specific: "authentication" → "user authentication with JWT"
- Try different keywords: "storage" instead of "blockchain"
- Check available modules: `npx rapidkit ai info`

### Mock Mode Results Not Accurate

**Cause:** Mock embeddings are deterministic but not trained

**Solution:** Use real OpenAI API for production
```bash
# Get API key and generate real embeddings
npx rapidkit config set-api-key
npx rapidkit ai generate-embeddings
```

### Check Current Configuration

```bash
# View all settings
npx rapidkit config show

# Output shows:
# - AI enabled: true/false
# - API key: sk-proj-...****
# - Embeddings status: exists/not found
# - Module count: 27 modules
```

### Still Having Issues?

1. **Enable debug logging:**
   ```bash
   DEBUG=rapidkit:* npx rapidkit ai recommend "auth"
   ```

2. **Check for updates:**
   ```bash
   npm outdated rapidkit
   npm update rapidkit
   ```

3. **Report issue:**
   - GitHub: https://github.com/getrapidkit/rapidkit-npm/issues
   - Include: error message, OS, Node version, command used

## 📚 Commands Reference

### AI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `rapidkit ai recommend [query]` | Get module recommendations | `rapidkit ai recommend "auth"` |
| `rapidkit ai recommend [query] -n <N>` | Get top N recommendations | `rapidkit ai recommend "database" -n 3` |
| `rapidkit ai recommend [query] --json` | Get JSON output | `rapidkit ai recommend "auth" --json` |
| `rapidkit ai generate-embeddings` | Generate embeddings (one-time) | `rapidkit ai generate-embeddings` |
| `rapidkit ai generate-embeddings --force` | Force regenerate embeddings | `rapidkit ai generate-embeddings --force` |
| `rapidkit ai update-embeddings` | Update with latest modules | `rapidkit ai update-embeddings` |
| `rapidkit ai info` | Show AI features info | `rapidkit ai info` |

### Configuration Commands

| Command | Description | Example |
|---------|-------------|---------|
| `rapidkit config set-api-key` | Set OpenAI API key (interactive) | `rapidkit config set-api-key` |
| `rapidkit config set-api-key --key <KEY>` | Set API key directly | `rapidkit config set-api-key --key sk-proj-...` |
| `rapidkit config show` | Show current config | `rapidkit config show` |
| `rapidkit config remove-api-key` | Remove API key | `rapidkit config remove-api-key` |
| `rapidkit config ai enable` | Enable AI features | `rapidkit config ai enable` |
| `rapidkit config ai disable` | Disable AI features | `rapidkit config ai disable` |

### Recommend Command Options

```bash
rapidkit ai recommend [query] [options]

Options:
  -n, --number <count>  Number of recommendations (default: 5)
  --json               Output as JSON
  -h, --help           Display help
```

### Generate-Embeddings Command Options

```bash
rapidkit ai generate-embeddings [options]

Options:
  --force    Force regeneration even if embeddings exist
  -h, --help Display help
```

## 🚀 Coming Soon

- [ ] Code completion (GPT-4)
- [ ] Codebase chat
- [ ] Bug detection
- [ ] Test generation
- [ ] Architecture suggestions

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 License

MIT - See [LICENSE](../LICENSE)

---

**Questions?** Open an issue on [GitHub](https://github.com/getrapidkit/rapidkit-npm/issues)
