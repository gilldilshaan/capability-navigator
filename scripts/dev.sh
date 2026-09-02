#!/usr/bin/env bash
# Run the full PARALLAX stack locally: FastAPI backend + Vite frontend.
#   - Backend  (uvicorn) at http://localhost:8001
#   - Frontend (vite dev) at http://localhost:8000
#
# Usage: npm run dev:all   (or)   bash scripts/dev.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKEND_PORT="${BACKEND_PORT:-8001}"
FRONTEND_PORT="${FRONTEND_PORT:-8000}"

pids=()
cleanup() {
  echo
  echo "Stopping backend + frontend..."
  for pid in "${pids[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

# Prefer the repo-local virtualenv; fall back to uvicorn on PATH.
if [ -x ".venv/bin/uvicorn" ]; then
  UVICORN=".venv/bin/uvicorn"
else
  UVICORN="uvicorn"
fi

echo "Backend  -> http://localhost:${BACKEND_PORT}/health"
echo "Frontend -> http://localhost:${FRONTEND_PORT}/"
echo

"$UVICORN" src.api:app --host 0.0.0.0 --port "$BACKEND_PORT" &
pids+=($!)

npm run dev -- --port "$FRONTEND_PORT" &
pids+=($!)

wait
