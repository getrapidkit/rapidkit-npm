#!/usr/bin/env bash
set -euo pipefail

# End-user E2E: install npm CLI from an artifact (tarball) into isolated prefix,
# then run a realistic create workflow. Designed to mimic a user machine.
#
# Inputs:
#   Optional: RAPIDKIT_E2E_NPM_TARBALL=/abs/path/to/rapidkit-*.tgz
#     - If omitted, this script will build + pack the local repo npm package.
#   Optional: RAPIDKIT_E2E_ENGINE_SPEC=<pip spec or path>
#     - If omitted, defaults to the community distribution built at:
#         <repo-root>/dist-community/community
#       (build it via: make -C core community-dist-install)
#
# Optional:
#   RAPIDKIT_E2E_FULL=1   (run `rapidkit init` inside created project)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Resolve monorepo root robustly (Front/rapidkit-npm may be a nested git repo).
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
GIT_ROOT=""
if command -v git >/dev/null 2>&1; then
  GIT_ROOT="$(cd "$SCRIPT_DIR" && git rev-parse --show-toplevel 2>/dev/null || true)"
fi

ROOT="$MONOREPO_ROOT"
if [[ -n "$GIT_ROOT" ]] && [[ -d "$GIT_ROOT/core" ]] && [[ -d "$GIT_ROOT/Front/rapidkit-npm" ]]; then
  ROOT="$GIT_ROOT"
fi

TS="$(date +%s)"
BASE="/tmp/rapidkit-npm-e2e-user-$TS"
export HOME="$BASE/home"
export XDG_CACHE_HOME="$BASE/cache"
export npm_config_cache="$BASE/npm-cache"
export npm_config_prefix="$BASE/npm-prefix"
export PATH="$npm_config_prefix/bin:$PATH"

mkdir -p "$HOME" "$XDG_CACHE_HOME" "$npm_config_cache" "$npm_config_prefix"

step() {
  local name="$1"; shift
  local start end
  start="$(date +%s)"
  echo "E2E(user): >>> $name" >&2
  "$@"
  end="$(date +%s)"
  echo "E2E(user): <<< $name ($((end-start))s)" >&2
}

echo "E2E(user): base=$BASE"

NPM_BIN="$(command -v npm || true)"
if [[ -z "$NPM_BIN" ]]; then
  echo "E2E(user): npm not found on PATH. Install Node.js (with npm) first." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "E2E(user): node not found on PATH." >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  true
elif command -v python >/dev/null 2>&1; then
  true
else
  echo "E2E(user): Python not found on PATH (python3/python)." >&2
  exit 1
fi

TARBALL="${RAPIDKIT_E2E_NPM_TARBALL:-}"

if [[ -z "$TARBALL" ]]; then
  NPM_DIR="$ROOT/Front/rapidkit-npm"
  if [[ ! -d "$NPM_DIR" ]]; then
    echo "E2E(user): rapidkit-npm directory not found: $NPM_DIR" >&2
    exit 1
  fi

  (
    cd "$NPM_DIR"

    # Ensure dependencies exist before build.
    if [[ ! -d node_modules ]]; then
      step "npm ci" "$NPM_BIN" ci
    fi

    step "build npm package" "$NPM_BIN" run -s build
    step "npm pack" "$NPM_BIN" pack --silent
    TARBALL_PATH="$(ls -1 *.tgz | tail -n 1)"
    echo "$NPM_DIR/$TARBALL_PATH" > "$BASE/tarball_path"
  )

  TARBALL="$(cat "$BASE/tarball_path")"
fi

if [[ ! -f "$TARBALL" ]]; then
  echo "E2E(user): npm tarball not found: $TARBALL" >&2
  exit 1
fi

ENGINE_SPEC="${RAPIDKIT_E2E_ENGINE_SPEC:-}"
if [[ -z "$ENGINE_SPEC" ]]; then
  if [[ -d "$ROOT/dist-community/community" ]]; then
    ENGINE_SPEC="$ROOT/dist-community/community"
  fi
fi

if [[ -z "$ENGINE_SPEC" ]]; then
  echo "E2E(user): Missing engine spec." >&2
  echo "Build the community distribution first:" >&2
  echo "  make -C core community-dist-install" >&2
  echo "Or set RAPIDKIT_E2E_ENGINE_SPEC (pip spec/path)." >&2
  exit 1
fi
export RAPIDKIT_CORE_PYTHON_PACKAGE="$ENGINE_SPEC"

echo "E2E(user): using RAPIDKIT_CORE_PYTHON_PACKAGE=$RAPIDKIT_CORE_PYTHON_PACKAGE"

step "npm install -g (isolated)" "$NPM_BIN" install -g "$TARBALL" >/dev/null

if ! command -v rapidkit >/dev/null 2>&1; then
  echo "E2E(user): rapidkit CLI not found on PATH after install" >&2
  exit 1
fi

step "rapidkit --version" rapidkit --version >/dev/null
step "rapidkit version --json" rapidkit version --json > "$BASE/version.json"
node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));" "$BASE/version.json" >/dev/null

# Create a workspace (non-interactive)
WORKSPACES="$BASE/workspaces"
mkdir -p "$WORKSPACES"
step "create workspace" rapidkit create project fastapi.standard e2e-app --output "$WORKSPACES" --skip-essentials --force

PROJECT_DIR="$WORKSPACES/e2e-app"
if [[ ! -d "$PROJECT_DIR/.rapidkit" ]]; then
  echo "E2E(user): expected .rapidkit directory in created project" >&2
  exit 1
fi

if [[ "${RAPIDKIT_E2E_FULL:-}" == "1" ]]; then
  step "project init (full)" bash -c "cd '$PROJECT_DIR' && rapidkit init"
fi

# Community safety: ui must not exist.
set +e
rapidkit ui serve >/dev/null 2>"$BASE/ui.err"
CODE=$?
set -e
if [[ "$CODE" -ne 2 ]]; then
  echo "E2E(user): expected exit=2 for missing 'ui', got exit=$CODE" >&2
  sed -n '1,80p' "$BASE/ui.err" >&2
  exit 1
fi
if ! grep -q "No such command 'ui'" "$BASE/ui.err"; then
  echo "E2E(user): expected generic missing-command message for 'ui'" >&2
  sed -n '1,80p' "$BASE/ui.err" >&2
  exit 1
fi

echo "E2E(user): OK"