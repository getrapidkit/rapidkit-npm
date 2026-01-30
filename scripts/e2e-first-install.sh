#!/usr/bin/env bash
set -euo pipefail

# Dev E2E (repo-local): build/pack the npm CLI, install it into an isolated prefix,
# then run core-bridged commands.
# - Uses the already-built *community* engine distribution at dist-community/ (built via core/Makefile)
# - Installs the npm package into an isolated prefix (no system/global pollution)
# - Uses isolated HOME/XDG_CACHE_HOME/npm cache

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

NPM_DIR="$ROOT/Front/rapidkit-npm"

if [[ ! -d "$NPM_DIR" ]]; then
  echo "E2E: rapidkit-npm directory not found: $NPM_DIR" >&2
  exit 1
fi

# Workspace-local isolation
TS="$(date +%s)"
BASE="/tmp/rapidkit-npm-first-install-$TS"
export HOME="$BASE/home"
export XDG_CACHE_HOME="$BASE/cache"
export npm_config_cache="$BASE/npm-cache"
export npm_config_prefix="$BASE/npm-prefix"
export PATH="$npm_config_prefix/bin:$PATH"

NPM_BIN="$(command -v npm || true)"

mkdir -p "$HOME" "$XDG_CACHE_HOME" "$npm_config_cache" "$npm_config_prefix"

echo "E2E(first-install): base=$BASE"

step() {
  local name="$1"; shift
  local start end
  start="$(date +%s)"
  echo "E2E(first-install): >>> $name" >&2
  "$@"
  end="$(date +%s)"
  echo "E2E(first-install): <<< $name ($((end-start))s)" >&2
}

# Pre-flight: Python required for the real bridge path. If missing, fail with a clear message.
if command -v python3 >/dev/null 2>&1; then
  true
elif command -v python >/dev/null 2>&1; then
  true
else
  echo "E2E(first-install): Python not found on PATH (python3/python)." >&2
  echo "Install Python 3.10+ to run the real bridge E2E." >&2
  exit 1
fi

# Build a local tarball for install (simulates a registry install, but offline).
TARBALL=""
(
  cd "$NPM_DIR"

  # Ensure dependencies are present. Keep output minimal.
  if [[ ! -d node_modules ]]; then
    step "yarn install" yarn -s install --frozen-lockfile
  fi

  step "yarn build" yarn -s build

  if [[ -n "$NPM_BIN" ]]; then
    step "npm pack" "$NPM_BIN" pack --silent
    TARBALL="$(ls -1 *.tgz | tail -n 1)"
  else
    # Fallback: build a tarball using yarn.
    # This keeps the test runnable on dev machines where npm isn't available.
    step "yarn pack" yarn -s pack >/dev/null
    TARBALL="$(ls -1 *.tgz | tail -n 1)"
  fi
  echo "$NPM_DIR/$TARBALL" > "$BASE/tarball_path"
)
TARBALL="$(cat "$BASE/tarball_path")"

if [[ ! -f "$TARBALL" ]]; then
  echo "E2E(first-install): tarball not found: $TARBALL" >&2
  exit 1
fi

RAPIDKIT_BIN="rapidkit"
if [[ -n "$NPM_BIN" ]]; then
  step "npm install -g (isolated)" "$NPM_BIN" install -g "$TARBALL" >/dev/null

  if ! command -v rapidkit >/dev/null 2>&1; then
    echo "E2E(first-install): rapidkit CLI not found on PATH after npm install -g" >&2
    exit 1
  fi
else
  # Fallback: install into a temp project and run the local bin.
  # Still validates first-time install behavior, but not the global install path.
  APP="$BASE/app"
  mkdir -p "$APP"
  (cd "$APP" && step "yarn add (temp app)" yarn -s add "$TARBALL" >/dev/null)
  RAPIDKIT_BIN="$APP/node_modules/.bin/rapidkit"
  if [[ ! -x "$RAPIDKIT_BIN" ]]; then
    echo "E2E(first-install): rapidkit bin not found after yarn add" >&2
    exit 1
  fi
fi

ENGINE_SPEC="${RAPIDKIT_E2E_ENGINE_SPEC:-}"

# Default to the community distribution built by:
#   make -C core community-dist-install
if [[ -z "${ENGINE_SPEC}" ]]; then
  if [[ -d "$ROOT/dist-community/community" ]]; then
    ENGINE_SPEC="$ROOT/dist-community/community"
  fi
fi

if [[ -z "${ENGINE_SPEC}" ]]; then
  echo "E2E(first-install): Missing engine spec. Build the community distribution first:" >&2
  echo "  make -C core community-dist-install" >&2
  echo "Or set RAPIDKIT_E2E_ENGINE_SPEC to a pip-installable spec/path." >&2
  exit 1
fi

if [[ -n "$ENGINE_SPEC" ]]; then
  export RAPIDKIT_CORE_PYTHON_PACKAGE="$ENGINE_SPEC"
  echo "E2E(first-install): using RAPIDKIT_CORE_PYTHON_PACKAGE=$RAPIDKIT_CORE_PYTHON_PACKAGE"
fi

# Verify CLI works and JSON commands produce parseable JSON.
step "rapidkit --version" "$RAPIDKIT_BIN" --version >/dev/null

"$RAPIDKIT_BIN" version --json > "$BASE/version.json"
step "parse version.json" node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));" "$BASE/version.json" >/dev/null

"$RAPIDKIT_BIN" list --json > "$BASE/list.json"
step "parse list.json" node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));" "$BASE/list.json" >/dev/null

# Workspace creation (real user workflow). This should not prompt.
WORKSPACES="$BASE/workspaces"
mkdir -p "$WORKSPACES"

# Prefer a stable, non-interactive create. Kit slugs are like fastapi.standard.
step "create workspace (fastapi.standard)" "$RAPIDKIT_BIN" create project fastapi.standard e2e-app --output "$WORKSPACES" --skip-essentials --force

PROJECT_DIR="$WORKSPACES/e2e-app"
if [[ ! -d "$PROJECT_DIR/.rapidkit" ]]; then
  echo "E2E(first-install): expected .rapidkit directory in created project" >&2
  echo "Project dir: $PROJECT_DIR" >&2
  ls -la "$PROJECT_DIR" || true
  exit 1
fi

if [[ "${RAPIDKIT_E2E_FULL:-}" == "1" ]]; then
  # Full scenario: bootstraps project prerequisites (can take time).
  step "project init (full)" bash -c "cd '$PROJECT_DIR' && '$RAPIDKIT_BIN' init"
fi

# Community safety: ui must not exist.
# We accept exit code 2 as 'no such command'. Any other success is a hard failure.
echo "E2E(first-install): rapidkit ui serve should be unavailable"
set +e
"$RAPIDKIT_BIN" ui serve >/dev/null 2>"$BASE/ui.err"
CODE=$?
set -e
if [[ "$CODE" -ne 2 ]]; then
  echo "E2E(first-install): expected exit=2 for missing 'ui', got exit=$CODE" >&2
  echo "stderr:" >&2
  sed -n '1,80p' "$BASE/ui.err" >&2
  exit 1
fi
if ! grep -q "No such command 'ui'" "$BASE/ui.err"; then
  echo "E2E(first-install): expected generic missing-command message for 'ui'" >&2
  echo "stderr:" >&2
  sed -n '1,80p' "$BASE/ui.err" >&2
  exit 1
fi

echo "E2E(first-install): OK"