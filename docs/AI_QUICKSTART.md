# 🚀 AI Features - Quick Start Guide

Get started with RapidKit AI recommendations in 60 seconds!

## Option 1: Zero-Config Start (Recommended) ⚡

Just run it - AI will guide you through everything:

```bash
npx rapidkit ai recommend "user authentication"
```

**First time?** You'll see this:

```
⚠️  Module embeddings not found
AI recommendations require embeddings to be generated.

? What would you like to do?
  🚀 Generate embeddings now (requires OpenAI API key)
  📝 Show me how to generate them manually
  ❌ Cancel
```

Select option 1, provide your OpenAI API key, and you're done! 🎉

## Option 2: Manual Setup (For Advanced Users)

### Step 1: Get API Key (2 minutes)

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy your key (starts with `sk-proj-...`)

### Step 2: Configure Key (30 seconds)

```bash
npx rapidkit config set-api-key
# Paste your API key when prompted
```

Or set as environment variable:
```bash
export OPENAI_API_KEY="sk-proj-..."
```

### Step 3: Generate Embeddings (1 minute, $0.50)

```bash
npx rapidkit ai generate-embeddings
```

You'll see:
```
🤖 Generating AI embeddings for RapidKit modules...
📡 Fetching modules from RapidKit...
✓ Found 27 modules

💰 Estimated cost: ~$0.500
   (Based on 27 modules at $0.02/1M tokens)

? Generate embeddings now? Yes
```

**This is a ONE-TIME cost!** Embeddings last forever.

### Step 4: Use It! (Instant)

```bash
npx rapidkit ai recommend "authentication with social login"
```

Output:
```
📦 Recommended Modules:

1. Authentication Core
   Complete authentication with JWT, OAuth 2.0, secure sessions
   Match: 95.2% - Matches: auth, login, oauth
   Category: auth

2. Users Core
   User management with profiles, roles, permissions
   Match: 88.7% - Matches: user, social
   Category: auth
   Requires: authentication-core

💡 Quick install (top 3):
   rapidkit add module authentication-core users-core
```

## Option 3: Test Without API Key (Mock Mode)

No API key? No problem! Try it in mock mode:

```bash
npx rapidkit ai recommend "database with caching"
```

You'll see:
```
⚠️  OpenAI API key not configured - using MOCK MODE for testing

📝 Note: Mock embeddings provide approximate results for testing.
   For production, configure your OpenAI API key:
   ...
```

Mock mode gives realistic (but not perfect) results for free!

## 🎯 Common Use Cases

### Find Authentication Modules
```bash
npx rapidkit ai recommend "user authentication with email and password"
npx rapidkit ai recommend "social login with Google and Facebook"
npx rapidkit ai recommend "two-factor authentication"
```

### Find Database Modules
```bash
npx rapidkit ai recommend "PostgreSQL database with migrations"
npx rapidkit ai recommend "MongoDB with async operations"
npx rapidkit ai recommend "database caching with Redis"
```

### Find Payment Modules
```bash
npx rapidkit ai recommend "payment processing with Stripe"
npx rapidkit ai recommend "subscription billing"
npx rapidkit ai recommend "invoice generation"
```

### Find Communication Modules
```bash
npx rapidkit ai recommend "email notifications with templates"
npx rapidkit ai recommend "SMS verification codes"
npx rapidkit ai recommend "real-time notifications"
```

### Find Infrastructure Modules
```bash
npx rapidkit ai recommend "background job processing"
npx rapidkit ai recommend "file storage with S3"
npx rapidkit ai recommend "rate limiting for APIs"
```

## 💡 Pro Tips

### 1. Be Specific
❌ Bad: "authentication"  
✅ Good: "user authentication with JWT and OAuth 2.0"

### 2. Mention Technologies
❌ Bad: "database"  
✅ Good: "PostgreSQL database with async support"

### 3. Describe Your Use Case
❌ Bad: "payments"  
✅ Good: "subscription payments with recurring billing"

### 4. Use Natural Language
❌ Don't: "auth jwt oauth session redis"  
✅ Do: "I need authentication with JWT tokens and Redis sessions"

### 5. Get More/Less Results
```bash
# Get top 3 only
npx rapidkit ai recommend "auth" --number 3

# Get top 10
npx rapidkit ai recommend "auth" --number 10
```

### 6. JSON Output for Scripts
```bash
npx rapidkit ai recommend "database" --json | jq '.recommendations[0].module.id'
```

## 🔧 Quick Commands

```bash
# Get recommendations
npx rapidkit ai recommend "query here"

# Generate embeddings (one-time)
npx rapidkit ai generate-embeddings

# Update embeddings (after RapidKit update)
npx rapidkit ai update-embeddings

# View info and pricing
npx rapidkit ai info

# Configure API key
npx rapidkit config set-api-key

# Check current config
npx rapidkit config show
```

## 💰 Pricing Summary

| Item | Cost | When |
|------|------|------|
| Setup (embeddings) | ~$0.50 | One-time only |
| Per query | ~$0.0002 | Every query |
| 1,000 queries | ~$0.20 | After setup |

**Total to get started: $0.50** (lasts forever!)

## ❓ Troubleshooting

### "Module embeddings not found"
👉 Just follow the interactive prompts - they'll guide you!

### "Invalid API key"
```bash
npx rapidkit config set-api-key
# Enter your correct API key
```

### "Quota exceeded"
👉 Check your billing: https://platform.openai.com/account/billing

### Want to test without spending money?
👉 Use mock mode - it works without an API key!

## 🎓 Learn More

- **Full Guide:** [AI_FEATURES.md](AI_FEATURES.md)
- **Technical Details:** [AI_DYNAMIC_INTEGRATION.md](AI_DYNAMIC_INTEGRATION.md)
- **Main README:** [../README.md](../README.md)

## 🚀 Ready to Build?

Start exploring modules with AI:
```bash
npx rapidkit ai recommend "what I want to build"
```

That's it! Happy building! 🎉
