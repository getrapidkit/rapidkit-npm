#!/bin/bash
# Release Script for v0.14.2
# Run this script to publish the new version

set -e  # Exit on error

echo "🚀 RapidKit npm v0.14.2 Release Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check working directory is clean
echo "📋 Step 1: Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes. Commit them first.${NC}"
    git status --short
    exit 1
fi
echo -e "${GREEN}✓${NC} Working directory is clean"
echo ""

# 2. Run tests
echo "🧪 Step 2: Running tests..."
npm run test
echo -e "${GREEN}✓${NC} All tests passed"
echo ""

# 3. Build
echo "🔨 Step 3: Building..."
npm run build
echo -e "${GREEN}✓${NC} Build successful"
echo ""

# 4. Check bundle size
echo "📦 Step 4: Checking bundle size..."
npm run bundle-size
echo ""

# 5. Lint and format check
echo "🔍 Step 5: Linting and format check..."
npm run lint
npm run format:check
echo -e "${GREEN}✓${NC} Code quality checks passed"
echo ""

# 6. Version bump
echo "📌 Step 6: Version bump to 0.14.2..."
npm version 0.14.2 -m "chore(release): v0.14.2 - Documentation & Cleanup"
echo -e "${GREEN}✓${NC} Version bumped to 0.14.2"
echo ""

# 7. Build again with new version
echo "🔨 Step 7: Final build with new version..."
npm run build
echo -e "${GREEN}✓${NC} Final build complete"
echo ""

# 8. Dry run publish
echo "👀 Step 8: Dry run publish (review what will be published)..."
npm publish --dry-run
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  Ready to publish to npm!${NC}"
read -p "Do you want to continue? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
    echo "❌ Release cancelled"
    exit 1
fi

# 9. Publish to npm
echo "📦 Step 9: Publishing to npm..."
npm publish
echo -e "${GREEN}✓${NC} Published to npm successfully!"
echo ""

# 10. Push to GitHub
echo "🐙 Step 10: Pushing to GitHub..."
git push origin main --tags
echo -e "${GREEN}✓${NC} Pushed to GitHub"
echo ""

# 11. Create GitHub Release (requires gh CLI)
if command -v gh &> /dev/null; then
    echo "🎉 Step 11: Creating GitHub Release..."
    gh release create v0.14.2 \
        --title "v0.14.2 - Documentation & Cleanup" \
        --notes-file releases/RELEASE_NOTES_v0.14.2.md
    echo -e "${GREEN}✓${NC} GitHub Release created"
else
    echo -e "${YELLOW}⚠️  gh CLI not found. Create GitHub release manually:${NC}"
    echo "   https://github.com/getrapidkit/rapidkit-npm/releases/new"
fi
echo ""

# Done!
echo "=========================================="
echo -e "${GREEN}🎉 Release v0.14.2 Complete!${NC}"
echo ""
echo "📦 npm: https://www.npmjs.com/package/rapidkit"
echo "🐙 GitHub: https://github.com/getrapidkit/rapidkit-npm/releases/tag/v0.14.2"
echo ""
echo "Next steps:"
echo "  1. Verify package on npm"
echo "  2. Test installation: npm install -g rapidkit@0.14.2"
echo "  3. Announce on social media/Discord"
echo ""
