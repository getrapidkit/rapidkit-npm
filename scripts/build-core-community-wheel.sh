#!/usr/bin/env bash
set -euo pipefail

# Builds a *community* wheel from the current monorepo Core using:
#   core/scripts/finalize_distribution.py
# Output: prints absolute wheel path to stdout.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Prefer git root when available; fall back to deriving from script path.
if command -v git >/dev/null 2>&1; then
  ROOT="$(cd "$SCRIPT_DIR" && git rev-parse --show-toplevel 2>/dev/null || true)"
else
  ROOT=""
fi

if [[ -z "$ROOT" ]]; then
  # scripts/ -> rapidkit-npm/ -> Front/ -> repo-root
  ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
fi

CORE_SRC="$ROOT/core"
FINALIZER="$CORE_SRC/scripts/finalize_distribution.py"

if [[ ! -f "$FINALIZER" ]]; then
  echo "Core finalizer not found: $FINALIZER" >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Python not found on PATH (python3/python)." >&2
  exit 1
fi

TS="$(date +%s)"
BASE="/tmp/rapidkit-core-community-build-$TS"
TARGET="$BASE/community-src"
BUILDER_VENV="$BASE/builder-venv"

mkdir -p "$TARGET"

# Copy minimal inputs required to build a wheel, without dragging repo junk.
# Prefer rsync for speed; fall back to tar.
copy_core() {
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude='.git/' \
      --exclude='dist/' \
      --exclude='build/' \
      --exclude='.venv/' \
      --exclude='.tox/' \
      --exclude='__pycache__/' \
      --exclude='*.pyc' \
      "$CORE_SRC/" "$TARGET/"
    return
  fi

  (cd "$CORE_SRC" && tar -cf - \
    --exclude='./.git' \
    --exclude='./dist' \
    --exclude='./build' \
    --exclude='./.venv' \
    --exclude='./.tox' \
    --exclude='./**/__pycache__' \
    --exclude='./**/*.pyc' \
    .) | (cd "$TARGET" && tar -xf -)
}

copy_core

# Finalize the copied tree into a community distribution.
# Note: this prunes paid modules/kits and writes src/core/distribution.json.
"$PY" "$TARGET/scripts/finalize_distribution.py" --tier community --source "$CORE_SRC" --target "$TARGET" >/dev/null

# Build wheel from the finalized tree.
"$PY" -m venv "$BUILDER_VENV"
"$BUILDER_VENV/bin/python" -m pip -q install -U pip
"$BUILDER_VENV/bin/python" -m pip -q install build

(cd "$TARGET" && "$BUILDER_VENV/bin/python" -m build -w -q)

WHEEL="$(ls -1 "$TARGET/dist"/*.whl | tail -n 1)"
"$PY" -c 'import os,sys; print(os.path.abspath(sys.argv[1]))' "$WHEEL"