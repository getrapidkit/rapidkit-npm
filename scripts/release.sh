#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'EOF'
Usage: scripts/release.sh [patch|minor|major|x.y.z] [--yes] [--no-publish]
    scripts/release.sh [..] [--allow-dirty]

Examples:
    scripts/release.sh patch
    scripts/release.sh minor --yes
    scripts/release.sh 0.22.0 --no-publish

Notes:
    - Runs quality checks before release.
    - Bumps version only when a bump argument is provided.
    - Always runs npm publish --dry-run before publish.
    - --allow-dirty skips clean git tree check (recommended only with --no-publish).
EOF
}

BUMP=""
AUTO_YES="false"
NO_PUBLISH="false"
ALLOW_DIRTY="false"

for arg in "$@"; do
    case "$arg" in
        patch|minor|major)
            BUMP="$arg"
            ;;
        --yes)
            AUTO_YES="true"
            ;;
        --no-publish)
            NO_PUBLISH="true"
            ;;
        --allow-dirty)
            ALLOW_DIRTY="true"
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            if [[ -z "$BUMP" && "$arg" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                BUMP="$arg"
            else
                echo "Unknown argument: $arg" >&2
                usage
                exit 1
            fi
            ;;
    esac
done

echo "🚀 RapidKit npm release flow"
echo "============================"

if [[ "$ALLOW_DIRTY" == "true" ]]; then
    echo "⚠️ Skipping clean-tree check (--allow-dirty)"
else
    echo "📋 Checking git status..."
    if [[ -n "$(git status --porcelain)" ]]; then
        echo "❌ Working tree is not clean. Commit/stash changes first."
        git status --short
        exit 1
    fi
    echo "✅ Working tree is clean"
fi

echo "🧪 Running quality checks..."
npm run validate
npm run build
npm run bundle-size
echo "✅ Quality checks passed"

if [[ -n "$BUMP" ]]; then
    echo "📌 Bumping version: $BUMP"
    npm version "$BUMP" -m "chore(release): v%s"
fi

VERSION="$(node -p "require('./package.json').version")"
TAG="v$VERSION"

echo "👀 Dry-run publish for $TAG"
npm publish --dry-run

if [[ "$NO_PUBLISH" == "true" ]]; then
    echo "ℹ️ --no-publish set. Stopping after dry-run."
    exit 0
fi

if [[ "$AUTO_YES" != "true" ]]; then
    read -r -p "Publish $TAG to npm? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo "❌ Release cancelled"
        exit 1
    fi
fi

echo "📦 Publishing $TAG to npm..."
npm publish

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "🐙 Pushing commits/tags to origin/$CURRENT_BRANCH"
git push origin "$CURRENT_BRANCH" --follow-tags

if command -v gh >/dev/null 2>&1; then
    echo "🎉 Creating GitHub release: $TAG"
    gh release create "$TAG" --generate-notes
else
    echo "ℹ️ gh CLI not found. Create release manually:"
    echo "   https://github.com/getrapidkit/rapidkit-npm/releases/new"
fi

echo "✅ Release complete: $TAG"
echo "📦 npm: https://www.npmjs.com/package/rapidkit"
