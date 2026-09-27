#!/usr/bin/env bash
# Runs the /next command in a FRESH opencode session, repeatedly, so context
# never accumulates. Each iteration is a separate `opencode run` = new session.
# Stops on the DONE sentinel, on the first failure, or after $MAX iterations.
set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"
export OPENCODE_DISABLE_AUTOCOMPACT=1

cd "$(dirname "$0")/.."

MAX="${1:-10}"
[[ "$MAX" =~ ^[0-9]+$ ]] || { echo "usage: $0 [max-iterations]"; exit 64; }

for ((i = 1; i <= MAX; i++)); do
  if [[ "$(head -1 HANDOFF.md)" == "DONE" ]]; then
    echo "==> all parts complete"
    exit 0
  fi

  part="$(awk '/^## Next part/{getline; getline; print; exit}' HANDOFF.md)"
  echo "==> iteration $i/$MAX :: ${part:-<no next part>}"

  if ! opencode run --command next --auto; then
    echo "==> iteration $i failed - halting (state preserved in HANDOFF.md)"
    exit 1
  fi
done

echo "==> reached iteration cap ($MAX); run again to continue"
